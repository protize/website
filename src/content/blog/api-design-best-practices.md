---
title: "API Design Best Practices: Building APIs That Developers Love"
description: "A comprehensive guide to designing REST APIs that are intuitive, consistent, and a joy to consume — covering naming, response structure, pagination, error handling, versioning, and documentation."
pubDate: 2026-06-10
author: "Protize Team"
tags: ["api-design", "rest", "nestjs", "best-practices", "backend", "documentation"]
category: "Architecture"
coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop"
coverAlt: "Abstract digital connections representing API communication"
---


An API is a contract. It's a promise you make to every consumer of your backend — your frontend team, your mobile developers, third-party integrators, and future versions of yourself. Break the contract and you break their applications. Make the contract confusing and you slow down every developer who ever touches it.

A poorly designed API creates cascading problems: frontend developers have to guess what parameters to send, mobile apps break when the API changes unexpectedly, and debugging is an archaeological dig through inconsistent response formats.

A well-designed API, on the other hand, is intuitive, predictable, and self-documenting. Developers understand it without reading extensive docs. Changes are made safely with versioning. Errors are informative and actionable.

In this blog, we'll cover everything you need to design APIs that developers genuinely enjoy working with.

---

## Principle 1: Resources, Not Actions

RESTful APIs are organized around **resources** — the nouns of your application. Your URL structure should reflect what you're working with, not what you're doing to it.

The HTTP method already tells you the action. The URL tells you the resource.

```
# ❌ Bad — verbs in URLs, action-oriented
GET    /getUser/123
POST   /createPost
PUT    /updatePost/456
DELETE /removeComment?commentId=789
POST   /getUserPosts?userId=123
GET    /fetchAllCommentsByPost/456

# ✅ Good — nouns, resource-oriented
GET    /users/123
POST   /posts
PUT    /posts/456
DELETE /posts/456/comments/789
GET    /users/123/posts
GET    /posts/456/comments
```

### Standard HTTP Method Semantics

Every developer knows these — use them correctly:

| Method | Semantics | Body | Idempotent? |
|--------|-----------|------|-------------|
| GET | Read resource(s) | No | Yes |
| POST | Create a resource | Yes | No |
| PUT | Replace a resource entirely | Yes | Yes |
| PATCH | Partially update a resource | Yes | Yes |
| DELETE | Remove a resource | No | Yes |

**Idempotent** means calling the request multiple times has the same result as calling it once. `DELETE /posts/1` twice is safe — the second call just finds nothing to delete. `POST /posts` twice creates two posts.

### Nested Resources

Use nesting for resources that only make sense in context of a parent:

```
GET  /posts/:postId/comments           # All comments for a post
POST /posts/:postId/comments           # Create a comment on a post
GET  /posts/:postId/comments/:id       # A specific comment
DELETE /posts/:postId/comments/:id    # Delete a specific comment
```

Don't nest more than 2 levels deep — it gets confusing:

```
# ❌ Too deep — hard to read and construct
GET /users/:userId/posts/:postId/comments/:commentId/reactions

# ✅ Better — flatten with a query param or separate endpoint
GET /comments/:commentId/reactions
GET /reactions?commentId=789
```

---

## Principle 2: Consistent Response Format

Every response your API returns should follow the same structure. This makes frontend code predictable — developers write one response handler and it works everywhere.

Define your format and stick to it religiously:

```typescript
// src/common/interceptors/response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: request.headers['x-request-id'] as string || 'N/A',
          version: process.env.APP_VERSION || '1.0.0',
        },
      })),
    );
  }
}
```

Apply it globally:

```typescript
// src/main.ts
import { TransformInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(3001);
}
```

Now every successful response looks like:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "My First Post",
    "slug": "my-first-post"
  },
  "meta": {
    "timestamp": "2026-03-15T10:30:00.000Z",
    "requestId": "abc-123",
    "version": "2.1.0"
  }
}
```

And for list endpoints:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 543,
      "totalPages": 28,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## Principle 3: Informative Error Responses

The HTTP status code tells consumers *that* something went wrong. Your error body should tell them *what* went wrong and ideally *how to fix it*.

```typescript
// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorId = uuid();

    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const body = exceptionResponse as any;
        message = body.message || message;
        code = body.code || this.statusToCode(status);
        details = Array.isArray(body.message) ? body.message : undefined;
      }
    }

    // Log server errors with full context
    if (status >= 500) {
      this.logger.error({
        errorId,
        status,
        message,
        path: request.url,
        method: request.method,
        exception,
      });
    }

    response.status(status).json({
      success: false,
      error: {
        id: errorId,      // Include so support can look up the full error
        code,
        message,
        details,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private statusToCode(status: number): string {
    const codes: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'RATE_LIMIT_EXCEEDED',
      500: 'INTERNAL_ERROR',
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }
}
```

### Error Response Examples

```json
// 400 — Validation failure (class-validator errors)
{
  "success": false,
  "error": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["email must be a valid email address"],
      "password": [
        "password must be at least 8 characters",
        "password must contain at least one uppercase letter"
      ]
    }
  }
}

// 404 — Resource not found
{
  "success": false,
  "error": {
    "id": "550e8400-...",
    "code": "NOT_FOUND",
    "message": "Post #999 not found"
  }
}

// 409 — Conflict
{
  "success": false,
  "error": {
    "id": "550e8400-...",
    "code": "CONFLICT",
    "message": "An account with this email already exists"
  }
}
```

### HTTP Status Code Reference

| Code | Name | When To Use |
|------|------|-------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (include Location header) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Malformed request, validation failure |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Valid syntax but semantic errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server failure |

---

## Principle 4: Pagination, Filtering, and Sorting

Any endpoint that returns a list needs these three capabilities. Design them consistently from the start.

```typescript
// src/common/dto/pagination.dto.ts
import { IsInt, IsOptional, IsString, IsIn, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;
}

// Extended for posts
export class GetPostsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';
}
```

```typescript
// src/posts/posts.service.ts
async findAll(dto: GetPostsDto) {
  const { page, limit, sortBy, sortOrder, search, category, tag, status } = dto;
  const skip = (page - 1) * limit;

  const where: Prisma.PostWhereInput = {
    ...(status === 'published' && { published: true }),
    ...(status === 'draft' && { published: false }),
    ...(category && { category }),
    ...(tag && { tags: { has: tag } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const orderBy: Prisma.PostOrderByWithRelationInput = {
    [sortBy || 'createdAt']: sortOrder || 'desc',
  };

  const [posts, total] = await Promise.all([
    this.prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { author: { select: { id: true, name: true } } },
    }),
    this.prisma.post.count({ where }),
  ]);

  return {
    items: posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: skip + limit < total,
      hasPrev: page > 1,
    },
  };
}
```

API consumers use it naturally:

```
# Paginate
GET /posts?page=3&limit=10

# Filter
GET /posts?category=backend&tag=nestjs

# Search
GET /posts?search=postgresql+performance

# Sort
GET /posts?sortBy=title&sortOrder=asc

# Combine all
GET /posts?page=1&limit=5&category=frontend&search=react&sortBy=publishedAt&sortOrder=desc
```

---

## Principle 5: Rate Limiting

Protect your API from abuse and accidental hammering with rate limiting:

```bash
npm install @nestjs/throttler
```

```typescript
// src/app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,     // 1 second
        limit: 10,     // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000,    // 1 minute
        limit: 100,    // 100 requests per minute
      },
      {
        name: 'long',
        ttl: 3600000,  // 1 hour
        limit: 1000,   // 1000 requests per hour
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

Override limits for specific endpoints:

```typescript
import { Throttle, SkipThrottle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  // Stricter limit for login — prevent brute force
  @Throttle({ short: { ttl: 60000, limit: 5 } }) // 5 attempts per minute
  @Post('login')
  login() { ... }

  // No rate limit for public content
  @SkipThrottle()
  @Get('health')
  health() { ... }
}
```

Return rate limit headers so clients can respect them:

```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1678886400
Retry-After: 60
```

---

## Principle 6: API Versioning

APIs change. Business requirements evolve. What you build today won't be perfect forever. Without versioning, every breaking change risks breaking every consumer.

The key rule: **once an API version is published, it should never have breaking changes.** New features go in new versions.

```typescript
// src/main.ts
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI, // /v1/posts, /v2/posts
    defaultVersion: '1',      // Default for routes without explicit version
  });

  await app.listen(3001);
}
```

```typescript
// V1 — original format
@Controller({ path: 'posts', version: '1' })
export class PostsControllerV1 {
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // Returns: { id, title, content, authorName }
    return this.postsService.findOneV1(id);
  }
}

// V2 — improved format (without breaking V1)
@Controller({ path: 'posts', version: '2' })
export class PostsControllerV2 {
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // Returns: { id, title, content, author: { id, name, avatar } }
    // Also includes: tags, readingTime, relatedPosts
    return this.postsService.findOneV2(id);
  }
}
```

---

## Principle 7: Auto-Generated Documentation with Swagger

NestJS + Swagger creates interactive API documentation automatically from your decorators:

```bash
npm install @nestjs/swagger swagger-ui-express
```

```typescript
// src/main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('My Application API')
    .setDescription(`
      Complete REST API for My Application.
      
      ## Authentication
      Use the /auth/login endpoint to get an access token, then click 
      "Authorize" and enter: Bearer <your_token>
      
      ## Rate Limiting
      - 100 requests per minute per IP
      - 5 login attempts per minute per IP
    `)
    .setVersion('2.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('Authentication', 'Login, register, and token management')
    .addTag('Posts', 'Create, read, update, and delete posts')
    .addTag('Users', 'User profile and account management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Remember auth between page refreshes
    },
  });

  await app.listen(3001);
}
```

Annotate your DTOs:

```typescript
// src/posts/dto/create-post.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'The post title',
    example: 'Building High-Performance APIs with NestJS',
    minLength: 5,
    maxLength: 200,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Full post content in Markdown format',
    example: '# Introduction\n\nThis is my post content...',
  })
  @IsString()
  @MinLength(50)
  content: string;

  @ApiPropertyOptional({
    description: 'Short summary shown in post listings',
    example: 'Learn how to build scalable APIs...',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional({
    description: 'Post category',
    enum: ['Frontend', 'Backend', 'Architecture', 'Database', 'DevOps'],
    example: 'Backend',
  })
  @IsOptional()
  @IsString()
  category?: string;
}
```

Annotate your controllers:

```typescript
// src/posts/posts.controller.ts
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  @ApiOperation({
    summary: 'Get all posts',
    description: 'Returns a paginated list of published posts. Supports filtering by category, tag, and full-text search.',
  })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  @Get()
  findAll(@Query() query: GetPostsDto) { ... }

  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePostDto) { ... }
}
```

Your documentation is now live at `http://localhost:3001/api/docs` — interactive, always up to date with your code, and allowing developers to test endpoints directly in the browser.

---

## Conclusion

Great API design is an investment that pays dividends every day your application is in production. When you get it right — consistent resource naming, standardized response formats, informative errors, thoughtful pagination, rate limiting, proper versioning, and automatic documentation — your API becomes a joy to integrate with.

The developers on your frontend team will thank you. The mobile developers will thank you. Third-party integrators will thank you. And you'll thank yourself six months later when adding a new feature doesn't require untangling a mess of inconsistent endpoints.

Build your API like a public product, even if it's only internal. The standards are worth it.
