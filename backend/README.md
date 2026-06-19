# Smart Booking System Backend

NestJS + TypeScript backend for the Smart Booking System v1. The implementation follows `docs/backend-v1-plan.md`: modular monolith, Clean Architecture boundaries, Prisma/PostgreSQL, Redis, BullMQ, JWT auth, dynamic scheduling, waitlist, notifications, Google Calendar sync, and ICS export.

## Local Development

```bash
npm install
cp .env.example .env
docker compose up -d
npm run prisma:migrate
npm run start:dev
```

API base path: `http://localhost:3000/api/v1`  
Swagger UI: `http://localhost:3000/api/docs`

## Docker Setup

`docker-compose.yml` starts:

- PostgreSQL 16 at `localhost:5432`
- Redis 7 at `localhost:6379`

Useful commands:

```bash
docker compose up -d
docker compose ps
docker compose down
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string used by Prisma.
- `REDIS_URL`: Redis connection string for slot holds and BullMQ.
- `JWT_SECRET`: JWT access token signing secret.
- `JWT_REFRESH_SECRET`: Reserved refresh-token secret setting.
- `JWT_ACCESS_EXPIRES_IN`: Access token TTL, default `15m`.
- `JWT_REFRESH_EXPIRES_DAYS`: Refresh token TTL in days, default `30`.
- `ENCRYPTION_SECRET`: Secret used to encrypt persisted OAuth tokens.
- `GOOGLE_CLIENT_ID`: Google OAuth client ID.
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret.
- `GOOGLE_CALLBACK_URL`: Backward-compatible Google auth callback fallback.
- `GOOGLE_AUTH_CALLBACK_URL`: Google login callback URL.
- `GOOGLE_CALENDAR_CALLBACK_URL`: Google Calendar OAuth callback URL.
- `SMTP_HOST`: SMTP host for Nodemailer.
- `SMTP_PORT`: SMTP port, usually `587`.
- `SMTP_SECURE`: `true` for SMTPS.
- `SMTP_USER`: SMTP username.
- `SMTP_PASS`: SMTP password.
- `SMTP_FROM`: Sender email address.
- `BUSINESS_TIMEZONE`: Default business timezone, `Asia/Jerusalem`.
- `PORT`: NestJS HTTP port, default `3000`.

## Implemented Modules

- `identity`: register, login, refresh token, Google auth structure, JWT guards, roles.
- `business`: single-tenant business profile and local logo upload.
- `catalog`: public services and owner service management.
- `scheduling`: availability, slots, booking, cancellation, rescheduling, admin calendar.
- `customers`: owner customer list and appointment history.
- `waitlist`: customer waitlist and cancellation-event processing.
- `notifications`: email queue, SMTP adapter, booking/cancellation emails.
- `integrations`: Google Calendar connection/sync and ICS export.
- `health`: DB/Redis health endpoint.

## API Inventory

### Public APIs

- `GET /api/v1/health`
- `GET /api/docs`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/google`
- `GET /api/v1/auth/google/callback`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/business`
- `GET /api/v1/services`
- `GET /api/v1/services/:id`
- `GET /api/v1/availability`

### Customer APIs

- `POST /api/v1/appointments`
- `GET /api/v1/appointments/:id/ics`
- `GET /api/v1/me/appointments`
- `GET /api/v1/me/appointments/:id`
- `PATCH /api/v1/me/appointments/:id/cancel`
- `PATCH /api/v1/me/appointments/:id/reschedule`
- `POST /api/v1/waitlist`
- `GET /api/v1/me/waitlist`
- `DELETE /api/v1/me/waitlist/:id`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Owner/Admin APIs

- `PUT /api/v1/business`
- `POST /api/v1/business/logo`
- `GET /api/v1/admin/services`
- `POST /api/v1/admin/services`
- `PATCH /api/v1/admin/services/:id`
- `DELETE /api/v1/admin/services/:id`
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
- `GET /api/v1/admin/customers`
- `GET /api/v1/admin/customers/:id`
- `GET /api/v1/admin/waitlist`
- `GET /api/v1/admin/integrations/calendar`
- `POST /api/v1/admin/integrations/calendar/google/connect`
- `GET /api/v1/admin/integrations/calendar/google/callback`
- `DELETE /api/v1/admin/integrations/calendar`

## Swagger Status

Swagger is enabled at `/api/docs` and includes:

- Controller tags by bounded context.
- DTO validation metadata from `class-validator`.
- Bearer auth metadata on protected endpoints.
- File upload schema for business logo upload.
- Standard documented error envelope for validation, auth, forbidden, not found, and conflict responses.

## Testing

```bash
npm run build
npm test
npm run test:e2e
```

Current coverage includes:

- Unit specs for notification handlers/processors and integration ICS/calendar sync.
- E2E specs for auth, health, business/catalog, scheduling, customers, waitlist, and DTO validation.

## Known Limitations

- Single-tenant only; no `tenant_id` or marketplace model.
- `SimpleSlotStrategy` only; no AI or smart optimization in v1.
- Local logo storage only; S3 is a future adapter.
- In-process event bus in v1; not distributed across multiple API instances.
- Calendar sync depends on Google OAuth configuration and runs asynchronously.
- SMS/WhatsApp/push notifications are not included in v1.
