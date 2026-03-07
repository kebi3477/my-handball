# MyHandball 모노레포

React 웹앱과 NestJS API로 구성된 핸드볼 경기/랭킹/팀 정보를 제공하는 프로젝트입니다. 온보딩(Welcome) 제출 데이터를 Postgres에 기록하며, Redis를 캐시로 사용합니다.

## 레포 구조
- `apps/web` – Vite 기반 React 18 SPA, TypeScript + SCSS, Recoil 상태.
- `apps/api` – NestJS REST API, TypeORM(PostgreSQL) + Redis.
- `packages/config` – tsconfig/ESLint 공유 설정.
- `packages/shared` – 공용 타입·유틸(플레이스홀더).
- 루트: pnpm 워크스페이스 + Turborepo 구성.

## 주요 기능
- 일정/팀/랭킹 조회 (API: `/api/schedule`, `/api/team`, `/api/ranking`).
- 온보딩(Welcome) 제출 시 선택한 성별/연령/팀 정보를 DB에 저장 (`POST /api/welcome/submissions`).
- CORS 기본 허용: `http://localhost:5173` 등 프론트 개발 도메인.

## 개발 환경 준비
- Node.js 20 이상, pnpm 9 이상.
- 로컬 Postgres, Redis 필요. (도커 compose로 함께 기동 가능)

### 의존성 설치
```bash
pnpm install
```

### 환경변수
- `apps/api/.env` (예시는 `.env.example` 참고)
  - `BASE` 크롤링 원본 URL
  - `PORT` API 포트 (기본 3000)
  - `REDIS_URL` 예: `redis://127.0.0.1:6379/0`
  - `DATABASE_URL` 예: `postgresql://postgres:postgres@localhost:5432/myhandball`
  - `DATABASE_SSL` `false` 또는 `true` (배포 시 필요하면 `true` + SSL 설정)
  - `CORS_ORIGINS` (배포 도메인 필요 시 추가)
- `apps/web`는 `VITE_API_BASE_URL`(옵션)로 API 베이스를 지정. 미지정 시 현재 브라우저 origin 사용.

### 로컬 개발
- 웹/백 동시 실행:
```bash
pnpm dev          # turborepo로 web+api 동시 실행
```
- 개별 실행:
```bash
pnpm --filter @koha/web dev   # http://localhost:5173
pnpm --filter @koha/api dev   # http://localhost:3000/api
```
- 빌드:
```bash
pnpm build
```
- 린트:
```bash
pnpm lint
```

## 데이터베이스
- TypeORM `synchronize: true`로 개발용 자동 스키마 반영. 운영에서는 마이그레이션 도구로 전환 권장.
- 온보딩 테이블: `welcome_submissions` (`user_gender`, `age_group`, `team_gender`, `team_num`, `team_name`, `team_logo_url`, `created_at`).

## 도커/배포
- `docker-compose.yml`에 `postgres`, `redis`, `api`, `web` 포함.
  - API는 `DATABASE_URL` 기본값으로 `postgres` 서비스에 연결.
  - 웹은 `VITE_API_BASE_URL` 빌드 ARG로 API 도메인을 주입 가능.
- 실행:
```bash
docker compose up -d --build
```
- HTTPS 사용 시 `ssl/` 디렉터리에 인증서를 두고 `web` 서비스 443 포트/마운트를 유지.

## 기타
- 글로벌 API Prefix: `/api`.
- 캐시: `apps/api/src/cache/providers/redis.client.ts`에서 `REDIS_URL` 사용.
- 필요 시 CORS 도메인은 `.env`의 `CORS_ORIGINS`에 콤마로 추가.***
