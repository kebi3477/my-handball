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
