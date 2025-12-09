# Koha Light

A minimal monorepo using pnpm workspaces and Turborepo.

## Structure

```
koha-light/
├── apps/
│   ├── web/          # React + Vite + TypeScript + SCSS
│   └── api/          # NestJS REST API
├── packages/
│   ├── config/       # Shared tsconfig and ESLint configuration
│   └── shared/       # Shared types and utilities (placeholder)
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Development

Run all apps in development mode:

```bash
pnpm dev
```

Or run individual apps:

```bash
# Run web app only (http://localhost:5173)
pnpm --filter @koha/web dev

# Run API only (http://localhost:3000/api)
pnpm --filter @koha/api dev
```

### Build

Build all apps:

```bash
pnpm build
```

Build individual apps:

```bash
pnpm --filter @koha/web build
pnpm --filter @koha/api build
```

### Lint

```bash
pnpm lint
```

## Apps

### Web App (`apps/web`)

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: SCSS (no Tailwind)
- **Port**: 5173

### API (`apps/api`)

- **Framework**: NestJS
- **Type**: REST API
- **Global Prefix**: `/api`
- **CORS**: Enabled for `http://localhost:5173`
- **Port**: 3000

**Endpoints:**
- `GET /api` - Hello message
- `GET /api/health` - Health check

## Packages

### `@koha/config`

Shared configuration for TypeScript and ESLint used across the monorepo.

### `@koha/shared`

Placeholder for shared types and utilities between apps.

## Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: React, Vite, TypeScript, SCSS
- **Backend**: NestJS, TypeScript
- **Code Quality**: ESLint, TypeScript

## HTTPS 설정 (nginx, `/ssl` 인증서)

프로젝트 루트에 `/ssl` 디렉터리를 두고 다음 파일을 둡니다:

- `ssl/certificate.crt` (서버 인증서 혹은 fullchain)
- `ssl/private.key` (개인키)
- `ssl/ca_bundle.crt` (있다면 체인 번들)

`docker-compose.yml`의 `web` 서비스에 443 포트와 볼륨 마운트를 추가합니다:

```yaml
  web:
    ports:
      - "${WEB_PORT:-80}:80"
      - "443:443"
    volumes:
      - "./ssl:/etc/nginx/ssl:ro"
```

`apps/web/nginx.conf`를 SSL로 교체합니다:

```nginx
server {
  listen 80;
  server_name _;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  server_name _;

  ssl_certificate     /etc/nginx/ssl/certificate.crt;
  ssl_certificate_key /etc/nginx/ssl/private.key;
  ssl_trusted_certificate /etc/nginx/ssl/ca_bundle.crt;
  ssl_protocols       TLSv1.2 TLSv1.3;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri /index.html;
  }

  location /api/ {
    proxy_pass http://api:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

API CORS 허용을 위해 `apps/api/.env`에 배포 도메인을 추가합니다:

```
CORS_ORIGINS=https://your-domain.com
```

반영: `docker compose down && docker compose up -d --build`.
