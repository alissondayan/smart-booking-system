# Smart Booking Frontend

Next.js client foundation for the Smart Booking System.

## Phase 1 Scope

This frontend currently contains the architecture foundation only:

- Next.js App Router setup.
- Public, customer, and owner route shells.
- Business configuration and theme provider foundation.
- Auth/session and role guard foundation.
- Central API client and token storage abstraction.
- TanStack Query provider.
- Shared UI primitives and utilities.

Real customer booking, business management, owner dashboards, notifications, analytics, payments, staff, and calendar views are intentionally deferred to later phases.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Frontend: `http://localhost:3001`
Backend API: `http://localhost:3000/api/v1`

The Next.js config includes a local rewrite from `/api/backend/*` to the backend API base URL to avoid CORS friction during development.
