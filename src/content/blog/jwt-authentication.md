---
title: "Authentication Done Right: JWT, Refresh Tokens, and NestJS Guards"
description: "Build a complete, production-grade authentication system with short-lived JWT access tokens, secure refresh tokens, and NestJS Guards that protect your routes automatically."
pubDate: 2026-05-18
author: "Protize Team"
tags: ["nestjs", "authentication", "jwt", "security", "backend"]
category: "Security"
coverImage: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2070&auto=format&fit=crop"
coverAlt: "Lock and security shield representing authentication"
---

Authentication is the front door of your application. When users trust you with their passwords, emails, and personal data, they're making a bet that you've implemented security correctly. Get it wrong, and a breach can end your product. Get it right, and it becomes invisible — users just flow through your app without thinking about it.

In this blog, we'll implement a complete, production-grade authentication system in NestJS using JWT access tokens and refresh tokens — the pattern used by major applications including GitHub, Stripe, and Google.

---

## The Token Strategy Explained

Many tutorials show you how to issue a JWT and call it a day. But a single, long-lived JWT is problematic:

- If stolen, the attacker has access for days or weeks
- No way to revoke it without changing the secret key (which logs out everyone)
- No way to track active sessions

The **dual token strategy** solves this:

```
┌─────────────────────────────────────────────────────┐
│              Access Token (JWT)                      │
│  • Short-lived: 15 minutes                          │
│  • Stateless: server doesn't store it               │
│  • Sent in every API request (Authorization header) │
│  • If leaked: expires in 15 minutes max             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              Refresh Token                           │
│  • Long-lived: 7–30 days                           │
│  • Stored in database (hashed)                      │
│  • Used only to get new access tokens               │
│  • Can be revoked instantly (delete from DB)        │
│  • Stored in HttpOnly cookie (not accessible to JS) │
└─────────────────────────────────────────────────────┘
```

**The flow:**
1. User logs in → server issues access token + refresh token
2. Frontend uses access token for API calls
3. After 15 minutes, access token expires → 401 Unauthorized
4. Frontend silently calls `/auth/refresh` with refresh token
5. Server verifies refresh token against database, issues new pair
6. User never experiences a login interruption

---

## Database Schema

```sql
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(255) UNIQUE NOT NULL,
  name            VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
  email_verified  BOOLEAN DEFAULT false,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL,
  device_info VARCHAR(500),           -- "Chrome on macOS" — for session management UI
  ip_address  VARCHAR(45),
  expires_at  TIMESTAMP NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW(),
  last_used   TIMESTAMP DEFAULT NOW(),
  revoked     BOOLEAN DEFAULT false,
  
  INDEX idx_refresh_tokens_user (user_id),
  INDEX idx_refresh_tokens_hash (token_hash)
);
```

This table lets you show users all their active sessions (like GitHub does) and let them revoke individual sessions.

---

## NestJS Setup

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local
npm install bcrypt uuid
npm install -D @types/passport-jwt @types/passport-local @types/bcrypt
```

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({}), // No global secret — each token type has its own
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### Auth Service

```typescript
// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Called by LocalStrategy — validates email/password
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Use constant-time comparison even for non-existent users
      // to prevent timing attacks that reveal valid emails
      await bcrypt.compare(password, '$2b$12$invalid.hash.to.waste.time');
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async register(email: string, name: string, password: string) {
    // Check for existing user
    const existing = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    return this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
      },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async login(userId: number, email: string, role: string, deviceInfo?: string, ip?: string) {
    const tokens = await this.generateTokens(userId, email, role);
    await this.storeRefreshToken(userId, tokens.refreshToken, deviceInfo, ip);
    return tokens;
  }

  async refreshTokens(userId: number, refreshToken: string) {
    // Find this specific refresh token in the database
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { userId, revoked: false, expiresAt: { gt: new Date() } },
    });

    // Check if any stored token matches
    let validToken = null;
    for (const stored of storedTokens) {
      const matches = await bcrypt.compare(refreshToken, stored.tokenHash);
      if (matches) {
        validToken = stored;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate the refresh token — invalidate old one, issue new one
    await this.prisma.refreshToken.update({
      where: { id: validToken.id },
      data: { revoked: true },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const tokens = await this.generateTokens(userId, user.email, user.role);
    await this.storeRefreshToken(userId, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: number, refreshToken: string) {
    // Find and revoke the specific refresh token (logout from this device)
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { userId, revoked: false },
    });

    for (const stored of storedTokens) {
      const matches = await bcrypt.compare(refreshToken, stored.tokenHash);
      if (matches) {
        await this.prisma.refreshToken.update({
          where: { id: stored.id },
          data: { revoked: true },
        });
        break;
      }
    }
  }

  async logoutAllDevices(userId: number) {
    // Revoke ALL refresh tokens for this user
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  private async generateTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: number,
    refreshToken: string,
    deviceInfo?: string,
    ip?: string,
  ) {
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        deviceInfo,
        ipAddress: ip,
        expiresAt,
      },
    });
  }
}
```

### Passport Strategies

```typescript
// src/auth/strategies/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    return this.authService.validateUser(email, password);
  }
}
```

```typescript
// src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    // Optionally verify user still exists and isn't banned
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true },
    });

    if (!user) throw new UnauthorizedException('User no longer exists');
    return user;
  }
}
```

### Guards

```typescript
// src/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Allow routes decorated with @Public() to skip authentication
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

```typescript
// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true; // No roles required

    const { user } = context.switchToHttp().getRequest();

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `This action requires one of these roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
```

### Auth Controller

```typescript
// src/auth/auth.controller.ts
import {
  Controller, Post, Body, UseGuards, Request,
  Res, Get, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.name, dto.password);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(
      req.user.id,
      req.user.email,
      req.user.role,
      req.headers['user-agent'],
      req.ip,
    );

    // Store refresh token in HttpOnly cookie — not accessible to JavaScript
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/auth/refresh', // Only sent to refresh endpoint
    });

    // Access token is returned in the response body
    return { accessToken };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      req.user.sub,
      req.cookies.refreshToken,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    });

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.id, req.cookies.refreshToken);
    res.clearCookie('refreshToken');
  }

  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('sessions')
  async getSessions(@CurrentUser() user: any) {
    // Return all active refresh tokens (sessions) for this user
    return this.authService.getActiveSessions(user.id);
  }
}
```

---

## React Frontend — Transparent Token Refresh

```typescript
// lib/api-client.ts
import axios, { AxiosError } from 'axios';

let accessToken: string | null = null;

export function setAccessToken(token: string) {
  accessToken = token;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Send cookies (for refresh token)
});

// Attach current access token to every request
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle token expiry transparently
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newToken = data.accessToken;
        setAccessToken(newToken);

        // Retry all queued requests with new token
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed — user needs to log in again
        setAccessToken(null);
        refreshQueue = [];
        window.location.href = '/login';
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
```

---

## Conclusion

Proper authentication is not optional — it's the foundation everything else stands on. By implementing short-lived JWT access tokens (15 minutes) paired with HttpOnly-cookie-stored refresh tokens, rotating refresh tokens on every use, protecting routes with NestJS Guards, and handling token refresh transparently on the frontend — you build an authentication system that is both secure and completely invisible to your users.

Store your JWT secrets in a secrets manager (AWS Secrets Manager, HashiCorp Vault) in production, rotate them periodically, and always use HTTPS. These small operational habits are what separate production-ready authentication from tutorial-grade authentication.
