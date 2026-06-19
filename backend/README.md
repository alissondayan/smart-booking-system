# Smart Booking System Backend

NestJS + TypeScript backend for the Smart Booking System.

## Phase 1 Status

Implemented scaffold and shared infrastructure from `docs/backend-v1-plan.md`:

- NestJS application scaffold with strict TypeScript.
- PostgreSQL 16 and Redis 7 Docker Compose services.
- Prisma schema for all v1 entities from the planning document.
- Shared infrastructure modules for Prisma, Redis, BullMQ, encryption, validation, error handling, roles, and pagination.
- Health endpoint at `GET /api/v1/health`.
- Swagger UI at `GET /api/docs`.

## Phase 2 Status

Implemented Identity from the plan:

- `User` domain entity and repository port.
- Email/password register and login.
- JWT access token strategy and guard.
- Hashed refresh token persistence with rotation on refresh.
- Logout refresh-token revocation.
- Google OAuth Passport strategy and callback structure.
- `CurrentUser`, `Roles`, `RolesGuard`, and JWT guard foundation for CUSTOMER / OWNER access.

Identity endpoints:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/google`
- `GET /api/v1/auth/google/callback`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

## Local Setup

```bash
npm install
cp .env.example .env
docker compose up -d
npm run prisma:migrate
npm run start:dev
```

## Verification

```bash
npm run build
npm run test:e2e
```
