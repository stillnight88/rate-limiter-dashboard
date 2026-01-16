# Rate Limiter Admin Dashboard

## Overview

This project is an internal **admin dashboard** for monitoring and managing API rate‑limiting behavior across backend services. It provides authenticated access to request logs, rate‑limit decisions, and related system state, backed by a Redis‑based enforcement layer.

The system is designed for developers or internal teams who need visibility into how rate limits are applied, debug blocked requests, and validate rate‑limiting rules during development or operations.

This repository contains both the backend API and the frontend admin interface.

---

## Tech Stack

### Backend

* **Node.js** — Runtime environment
* **Express** — HTTP API framework
* **TypeScript** — Static typing and safer refactoring
* **MongoDB (Mongoose)** — Persistent storage for users and logs
* **Redis** — Mandatory dependency for distributed rate‑limiting state
* **JWT (cookie‑based)** — Authentication with access and refresh tokens
* **Helmet, CORS, Compression** — Basic security and HTTP optimizations

### Frontend

* **React (Vite)** — Admin UI
* **TypeScript** — Type‑safe UI development
* **React Router** — Client‑side routing
* **TanStack Query (React Query)** — Server state management
* **Tailwind CSS** — Utility‑first styling
* **Radix UI** — Accessible UI primitives

### Tooling

* **npm** — Package management
* **ESLint / Prettier** — Code quality and formatting

---

## Project Structure

The repository is organized as a **single repository with a clear backend / frontend split**, which is common for internal dashboards and admin tools.

```
RATE-LIMITER-DASHBOARD/
├── backend/                # Express + TypeScript API
│   ├── dist/               # Compiled output
│   ├── src/
│   │   ├── config/         # Runtime configuration (Redis setup)
│   │   ├── controllers/    # Request handlers (auth, logs, stats, config, abuse)
│   │   ├── middleware/     # Auth, firewall, and rate-limiting middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express route definitions
│   │   ├── scripts/        # One-off operational scripts
│   │   ├── types/          # Express type extensions
│   │   ├── utils/          # Shared helpers (IP extraction, Redis helpers, responses)
│   │   ├── app.ts          # Express app configuration
│   │   └── server.ts       # Server bootstrap
│   ├── package.json
│   └── tsconfig.json
├── docs/                   # Architecture and design documents
│   └── redis-architecture.md
├── frontend/               # React + Vite admin dashboard
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── api/            # API client functions (Axios)
│   │   ├── components/     # Feature-oriented UI components
│   │   │   ├── abuse/      # IP ban / unban UI
│   │   │   ├── analytics/  # Charts and analytics components
│   │   │   ├── config/     # Rate-limit configuration UI
│   │   │   ├── logs/       # Request log tables and controls
│   │   │   ├── stats/      # Dashboard statistic cards
│   │   │   ├── kokonutui/  # Downloaded components from Kokonut UI
│   │   │   ├── smoothui/   # Downloaded components from Smooth UI
│   │   │   └── ui/         # shadcn/ui generated components
│   │   ├── contexts/       # React context (authentication state)
│   │   ├── hooks/          # Domain-specific React hooks
│   │   ├── lib/            # Shared frontend utilities
│   │   ├── pages/          # Route-level pages
│   │   ├── routes/         # Route guards and routing setup
│   │   ├── types/          # Shared TypeScript types
│   │   ├── utils/          # Frontend-only helpers
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
├── LICENSE
└── README.md
```

The frontend intentionally combines **generated components (shadcn/ui)** with **downloaded UI blocks (Kokonut UI, Smooth UI)**, which is a pragmatic approach for internal dashboards where speed and consistency matter more than building every component from scratch.

---

## Setup & Installation

### Prerequisites

* Node.js (LTS recommended)
* MongoDB instance (local or remote)
* **Redis instance (required)**

Redis must be running and reachable **before starting the backend server**.  
The application relies on Redis for rate limiting, IP bans, analytics, and live configuration, and will not function correctly without an active Redis connection.

For local development, Redis is expected to be run using Docker:

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7
```

---

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file and define the required environment variables (see below).

4. Start the development server:

   ```bash
   npm run dev
   ```

---

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

The frontend expects the backend API to be running.

---

## Environment Variables

### Backend (`backend/.env`)

Required keys:

* `PORT`
* `MONGO_URI`
* `JWT_SECRET`
* `REDIS_URL`
* `NODE_ENV`

Only variable names are documented here. Values must be supplied by the operator.

### Frontend (`frontend/.env`)

Required keys:

* `VITE_API_BASE_URL`

This value is used by the frontend to determine the base URL for backend API requests.

---

## Available Scripts

### Backend

* `npm run dev` — Start the API in development mode
* `npm run build` — Compile TypeScript
* `npm start` — Run compiled output

### Frontend

* `npm run dev` — Start the Vite development server
* `npm run build` — Build production assets
* `npm run preview` — Preview the production build

---

## Architecture Overview

### Authentication Flow

* Cookie-based JWT authentication
* Short-lived access tokens
* Refresh token mechanism for session continuation
* Protected API routes enforced via middleware

### Rate Limiting Flow

* Incoming requests pass through a rate-limit middleware
* Redis stores counters and expiration windows
* Decisions (allowed / blocked) are enforced centrally
* Relevant activity is persisted for admin visibility

---

## Redis Usage (Required)

Redis is a **mandatory dependency** and acts as the shared, in-memory state store for all real-time and high-frequency operations in the system.

It is used for:

* **Rate limiting** — per-IP request counters with fixed time windows and automatic expiration
* **IP blocking / firewall rules** — immediate, cross-instance enforcement of bans
* **Request analytics** — per-minute counters used for time-series charts
* **IP activity ranking** — sorted sets used to identify high-traffic or abusive IPs
* **Live configuration** — rate-limit settings that can be updated without restarting services
* **Recent request logs** — bounded lists used by the admin dashboard

Redis provides low-latency access, atomic operations, and consistent state across multiple backend instances. These guarantees cannot be reliably achieved using application memory or a traditional database alone.

For a deeper explanation of the Redis design and trade-offs, see `docs/redis-architecture.md`.

---

## Testing

The project does not currently include automated unit, integration, or end‑to‑end tests.

Backend APIs, authentication flows, and rate‑limiting behavior were validated through **manual testing using Postman** during development.

---

## Limitations & Trade‑offs

* No automated test suite at this stage
* Redis is a single required dependency and a central point of failure
* The UI is admin‑focused and not intended for end‑users
* No horizontal scaling or multi‑region setup is currently implemented

These constraints are acknowledged design decisions based on the current scope.

---

## License

This project is licensed under the MIT License.
