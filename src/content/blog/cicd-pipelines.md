---
title: "CI/CD Pipelines for Full-Stack JavaScript: From Code to Production"
description: "Build a complete, automated pipeline using GitHub Actions and Docker that runs tests, builds images, and deploys your Next.js and NestJS application with zero downtime."
pubDate: 2026-06-01
author: "Protize Team"
tags: ["cicd", "devops", "github-actions", "docker", "deployment"]
category: "DevOps"
coverImage: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=2088&auto=format&fit=crop"
coverAlt: "Server infrastructure representing automated deployments"
---

Writing great code is only half the battle. Getting that code to production reliably — quickly, safely, and consistently, with every push — is the other half. A well-configured CI/CD pipeline is what separates professional engineering teams from everyone else.

Without automation, deployments become rituals. Someone manually SSHs into a server, runs some commands, and holds their breath. Mistakes happen. Different people deploy differently. Something works on the developer's machine but breaks in production.

With CI/CD, every code change triggers the exact same process: tests run, the application is built, Docker images are created, and deployment happens automatically. The process is documented in code, reproducible, and auditable.

In this blog, we'll build a complete CI/CD pipeline for a full-stack Next.js + NestJS application using **GitHub Actions** and **Docker**.

---

## The Pipeline We're Building

```
Developer pushes to feature branch
           ↓
    GitHub Actions triggers
           ↓
    ┌──────────────────┐
    │   Test Job        │
    │  • Install deps  │
    │  • Lint          │
    │  • Type check    │
    │  • Unit tests    │
    │  • E2E tests     │
    └────────┬─────────┘
             │ (only if tests pass)
             ↓ (only on main branch)
    ┌──────────────────┐
    │   Build Job       │
    │  • Build API img │
    │  • Build Web img │
    │  • Push to GHCR  │
    └────────┬─────────┘
             ↓
    ┌──────────────────┐
    │   Deploy Job      │
    │  • SSH to server │
    │  • Pull images   │
    │  • Run migrations│
    │  • Zero-downtime │
    │    restart        │
    └──────────────────┘
```

---

## Step 1: Dockerizing Your Applications

Docker ensures your application runs identically in development, CI, and production. We use **multi-stage builds** to keep production images small and secure.

### NestJS API Dockerfile

```dockerfile
# apps/api/Dockerfile

# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies (including devDeps)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the NestJS application
RUN npm run build:api

# ---- Stage 2: Production ----
FROM node:20-alpine AS production

# Install only what we need at runtime
RUN apk add --no-cache dumb-init

WORKDIR /app

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

ENV NODE_ENV=production

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

USER nestjs

EXPOSE 3001

# dumb-init handles signals properly (important for graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/apps/api/main.js"]
```

### Next.js Web Dockerfile

```dockerfile
# apps/web/Dockerfile

# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---- Stage 2: Build ----
FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Enable Next.js standalone output (much smaller image)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build:web

# ---- Stage 3: Production ----
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone mode includes only what's needed
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./public

USER nextjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

Enable standalone output in `next.config.js`:

```javascript
// apps/web/next.config.js
const nextConfig = {
  output: 'standalone', // Creates a self-contained output in .next/standalone
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'), // For monorepo
  },
};

module.exports = nextConfig;
```

### Docker Compose for Local Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
      target: production
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/myapp
      REDIS_URL: redis://redis:6379
      JWT_ACCESS_SECRET: local-dev-secret
      JWT_REFRESH_SECRET: local-dev-refresh-secret
      NODE_ENV: production
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      target: production
      args:
        NEXT_PUBLIC_API_URL: http://localhost:3001
    ports:
      - "3000:3000"
    depends_on:
      - api
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api
      - web

volumes:
  postgres_data:
```

---

## Step 2: Nginx Reverse Proxy

```nginx
# nginx.conf
events {
  worker_connections 1024;
}

http {
  upstream api {
    server api:3001;
  }

  upstream web {
    server web:3000;
  }

  server {
    listen 80;
    server_name yourdomain.com;

    # Route API traffic
    location /api/ {
      rewrite ^/api/(.*)$ /$1 break;
      proxy_pass http://api;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Route WebSocket traffic
    location /socket.io/ {
      proxy_pass http://api;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }

    # All other traffic goes to Next.js
    location / {
      proxy_pass http://web;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
}
```

---

## Step 3: GitHub Actions CI/CD Pipeline

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  API_IMAGE: ghcr.io/${{ github.repository }}/api
  WEB_IMAGE: ghcr.io/${{ github.repository }}/web

jobs:
  # =====================================================
  # JOB 1: Tests (runs on every push and PR)
  # =====================================================
  test:
    name: Test
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      REDIS_URL: redis://localhost:6379
      JWT_ACCESS_SECRET: test-access-secret
      JWT_REFRESH_SECRET: test-refresh-secret

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Required for Nx affected detection

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Set Nx base SHA
        uses: nrwl/nx-set-shas@v4

      - name: Run migrations on test DB
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

      - name: Lint (affected only)
        run: npx nx affected:lint --base=${{ env.NX_BASE }} --head=${{ env.NX_HEAD }} --parallel=3

      - name: Type check (affected only)
        run: npx nx affected:type-check --base=${{ env.NX_BASE }} --head=${{ env.NX_HEAD }}

      - name: Unit tests (affected only)
        run: npx nx affected:test
          --base=${{ env.NX_BASE }}
          --head=${{ env.NX_HEAD }}
          --parallel=3
          --coverage
          --coverageReporters=lcov

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info

      - name: E2E tests
        run: npx nx affected:e2e --base=${{ env.NX_BASE }} --head=${{ env.NX_HEAD }}

  # =====================================================
  # JOB 2: Build & Push Docker Images (main branch only)
  # =====================================================
  build:
    name: Build & Push Images
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    outputs:
      api_image: ${{ steps.meta-api.outputs.tags }}
      web_image: ${{ steps.meta-web.outputs.tags }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata for API image
        id: meta-api
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.API_IMAGE }}
          tags: |
            type=sha,prefix=sha-
            type=raw,value=latest

      - name: Build and push API image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/api/Dockerfile
          push: true
          tags: ${{ steps.meta-api.outputs.tags }}
          labels: ${{ steps.meta-api.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max  # Cache layers for faster future builds

      - name: Extract metadata for Web image
        id: meta-web
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.WEB_IMAGE }}
          tags: |
            type=sha,prefix=sha-
            type=raw,value=latest

      - name: Build and push Web image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/web/Dockerfile
          push: true
          tags: ${{ steps.meta-web.outputs.tags }}
          labels: ${{ steps.meta-web.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NEXT_PUBLIC_API_URL=${{ secrets.NEXT_PUBLIC_API_URL }}

  # =====================================================
  # JOB 3: Deploy to Production
  # =====================================================
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: production
      url: https://yourdomain.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Create deployment package
        run: |
          # Create a minimal deployment context
          mkdir deploy
          cp docker-compose.prod.yml deploy/docker-compose.yml
          cp nginx.conf deploy/nginx.conf

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            set -e  # Exit on any error

            echo "🚀 Starting deployment..."
            cd /app

            # Log in to registry
            echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io \
              -u ${{ github.actor }} --password-stdin

            # Pull latest images
            echo "📦 Pulling latest images..."
            docker pull ${{ env.API_IMAGE }}:latest
            docker pull ${{ env.WEB_IMAGE }}:latest

            # Run database migrations (before restarting the app)
            echo "🗄️ Running database migrations..."
            docker run --rm \
              --env-file /app/.env \
              ${{ env.API_IMAGE }}:latest \
              npx prisma migrate deploy

            # Zero-downtime restart
            echo "♻️ Restarting services..."
            docker compose up -d --no-deps --no-build api
            sleep 5  # Brief pause for API to start

            # Health check
            if curl -f http://localhost:3001/health; then
              echo "✅ API is healthy"
              docker compose up -d --no-deps --no-build web
            else
              echo "❌ API health check failed — rolling back"
              docker compose up -d --no-deps --no-build api  # Previous image is still cached
              exit 1
            fi

            # Clean up old images
            docker image prune -f

            echo "✅ Deployment complete!"
```

---

## Step 4: Production Compose File

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    image: ghcr.io/${GITHUB_REPOSITORY}/api:latest
    env_file: .env
    restart: always
    networks:
      - app

  web:
    image: ghcr.io/${GITHUB_REPOSITORY}/web:latest
    env_file: .env
    restart: always
    networks:
      - app

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro  # SSL certificates
    restart: always
    depends_on:
      - api
      - web
    networks:
      - app

networks:
  app:
    driver: bridge
```

---

## Step 5: Health Check Endpoint

Add a health endpoint to your NestJS app for monitoring and deployment verification:

```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    const dbStatus = await this.checkDatabase();

    return {
      status: dbStatus ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      services: {
        database: dbStatus ? 'up' : 'down',
      },
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
```

---

## Conclusion

A solid CI/CD pipeline is one of the highest-leverage investments you can make in your engineering process. By Dockerizing your applications for consistent environments, using GitHub Actions to automate testing and deployment, and implementing proper health checks for deployment verification — you transform deployments from stressful manual procedures into automated, reliable events.

The pipeline we've built runs the same process every time: tests pass → images build → database migrates → services restart → health checks confirm success. That predictability is what lets teams deploy multiple times per day with confidence.
