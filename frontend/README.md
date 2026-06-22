# Smart Booking Frontend

Next.js client foundation for the Smart Booking System.

## Implemented Scope

This frontend currently contains the Phase 1 foundation and Phase 2 customer booking flow:

- Next.js App Router setup.
- Public, customer, and owner route shells.
- Business configuration and theme provider foundation.
- Auth/session and role guard foundation.
- Central API client and token storage abstraction.
- TanStack Query provider.
- Shared UI primitives and utilities.
- Services catalog and service details pages using backend APIs.
- Availability-driven booking flow using backend slot APIs.
- Booking creation and confirmation using authenticated backend APIs.
- Login and registration forms using backend auth APIs.
- Customer dashboard, appointments list, appointment detail, cancellation, profile, and waitlist views.

Business management, owner dashboards, notifications, analytics, payments, staff, and calendar views are intentionally deferred to later phases.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Frontend: `http://localhost:3001`
Backend API: `http://localhost:3000/api/v1`

The Next.js config includes a local rewrite from `/api/backend/*` to the backend API base URL to avoid CORS friction during development.

## Customer Flow Routes

- `/services`: services catalog.
- `/services/[serviceId]`: service details.
- `/book`: booking entry point.
- `/book/service/[serviceId]`: available appointments and booking creation.
- `/book/confirmation/[appointmentId]`: booking confirmation.
- `/auth/login`: login.
- `/auth/register`: registration.
- `/account`: customer dashboard.
- `/account/appointments`: customer appointment list.
- `/account/appointments/[appointmentId]`: appointment details and cancellation.
- `/account/waitlist`: customer waitlist entries.
