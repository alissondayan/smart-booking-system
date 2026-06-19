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

## Phase 3 Status

Implemented Business + Catalog from the plan:

- Public business profile read.
- OWNER-only business profile update.
- OWNER-only business logo upload through `StoragePort` and local storage adapter.
- Public active service catalog reads.
- OWNER-only admin service create, update, list-all, and soft delete.

Business and Catalog endpoints:

- `GET /api/v1/business`
- `PUT /api/v1/business`
- `POST /api/v1/business/logo`
- `GET /api/v1/services`
- `GET /api/v1/services/:id`
- `GET /api/v1/admin/services`
- `POST /api/v1/admin/services`
- `PATCH /api/v1/admin/services/:id`
- `DELETE /api/v1/admin/services/:id`

## Phase 4 Status

Implemented Scheduling Core from the plan:

- Weekly availability rules.
- Date-specific availability overrides.
- Blocked times and holidays.
- Public slot generation through replaceable `SlotStrategy`.
- `SimpleSlotStrategy` for chronological v1 ordering.
- Customer booking, cancel, reschedule, and appointment listing.
- Owner appointment calendar, cancel, and notes management.
- Anti double-booking with Redis slot holds plus Serializable transaction overlap checks.

Scheduling endpoints:

- `GET /api/v1/availability`
- `POST /api/v1/appointments`
- `GET /api/v1/me/appointments`
- `GET /api/v1/me/appointments/:id`
- `PATCH /api/v1/me/appointments/:id/cancel`
- `PATCH /api/v1/me/appointments/:id/reschedule`
- `GET /api/v1/admin/appointments`
- `GET /api/v1/admin/appointments/:id`
- `PATCH /api/v1/admin/appointments/:id/cancel`
- `PATCH /api/v1/admin/appointments/:id/notes`
- `GET /api/v1/admin/availability/rules`
- `PUT /api/v1/admin/availability/rules`
- `GET /api/v1/admin/availability/dates`
- `PUT /api/v1/admin/availability/dates/:date`
- `DELETE /api/v1/admin/availability/dates/:date`
- `GET /api/v1/admin/blocked-times`
- `POST /api/v1/admin/blocked-times`
- `DELETE /api/v1/admin/blocked-times/:id`
- `GET /api/v1/admin/holidays`
- `POST /api/v1/admin/holidays`
- `DELETE /api/v1/admin/holidays/:id`

## Phase 5 Status

Implemented Customers from the plan:

- OWNER-only customer list with search and pagination.
- OWNER-only customer details with appointment history.
- Customers repository behind a module port.

Customer management endpoints:

- `GET /api/v1/admin/customers`
- `GET /api/v1/admin/customers/:id`

## Phase 6 Status

Implemented Waitlist + event wiring from the plan:

- CUSTOMER waitlist join.
- CUSTOMER personal waitlist listing and cancellation.
- OWNER waitlist management view with `serviceId` and `status` filters.
- In-process domain event bus behind `EventBusPort`.
- Scheduling publishes appointment domain events.
- `AppointmentCancelled` handler marks the first matching ACTIVE waitlist entry as NOTIFIED.

Waitlist endpoints:

- `POST /api/v1/waitlist`
- `GET /api/v1/me/waitlist`
- `DELETE /api/v1/me/waitlist/:id`
- `GET /api/v1/admin/waitlist`

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
