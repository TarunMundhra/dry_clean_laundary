<div align="center">
	<h1>Mini Laundry Order Management System</h1>
	<p>Lightweight dry-cleaning order management with fast tracking and clear delivery timelines.</p>
</div>

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Deployed](https://img.shields.io/badge/Deployed-Render%20%2B%20Vercel-00A2FF)

## ⚡ Quick Start

```bash
cd laundry-system/backend && npm install && npm run dev
cd ../frontend && npm install && npm run dev
start http://localhost:5173
```

## 🧭 Project Overview

Project name: Mini Laundry Order Management System

Assignment: Build a lightweight dry-cleaning order management system for a store.

Goal: Create orders, track status, calculate billing, and view a business dashboard.

Time limit: 72 hours.

Deployment targets:

- Backend on Render.
- Frontend on Vercel.
- Swagger docs served from the backend.

Admin credentials (local default):

- Username: admin
- Password: admin123

## 🧱 Tech Stack

| Layer      | Tech                                                                 | Notes                                                         |
| ---------- | -------------------------------------------------------------------- | ------------------------------------------------------------- |
| Backend    | Node.js + Express (TypeScript, strict mode)                          | REST API with strict typing and middleware-driven validation. |
| Backend    | MongoDB + Mongoose (Atlas for production)                            | Atlas in production, local Mongo for dev.                     |
| Backend    | JWT authentication (Bearer token)                                    | Hardcoded admin credentials via env vars.                     |
| Backend    | express-validator for input validation                               | Request validation at the route layer.                        |
| Backend    | Swagger UI (swagger-ui-express + static swagger.json)                | Static spec served at /api/docs.                              |
| Backend    | Pino logger                                                          | Structured logging, no console.log.                           |
| Backend    | Jest + Supertest + mongodb-memory-server for tests                   | Full API tests without a real DB.                             |
| Frontend   | React 18 + Vite (TypeScript)                                         | SPA built with modern build tooling.                          |
| Frontend   | TailwindCSS (custom design tokens via CSS variables)                 | Warm palette and consistent UI tokens.                        |
| Frontend   | TanStack Query v5 (data fetching + caching + auto-refresh)           | Cached queries and auto-refresh.                              |
| Frontend   | React Hook Form + Zod (form validation)                              | Client-side form validation.                                  |
| Frontend   | React Router v6                                                      | Routing for landing, login, dashboard, and orders.            |
| Frontend   | Axios with interceptors                                              | JWT injection + 401 handling.                                 |
| Deployment | Backend: Render (free tier, auto-deploy on push)                     | Web service with build and start commands.                    |
| Deployment | Frontend: Vercel (auto-deploy on push, SPA rewrites via vercel.json) | SPA routing via rewrites.                                     |

## ✅ Features

### Core

- [x] Create order - customer name, phone (Indian 10-digit validated), garments.
- [x] Auto-calculate total from garment price catalog (10 garment types).
- [x] Unique Order ID generated: format ORD-YYYYMMDD-XXXX.
- [x] Status management: RECEIVED -> PROCESSING -> READY -> DELIVERED.
- [x] Forward-only status transitions (backward transitions rejected with 400).
- [x] List all orders with pagination (10 per page).
- [x] Filter by status, garment type, and search (name / phone / order ID).
- [x] Dashboard: total orders, total revenue, orders by status, today's stats.
- [x] JWT authentication on all protected routes.

### Bonus

- [x] React frontend with a full UI (Landing, Login, Dashboard, Orders pages).
- [x] Estimated delivery date (configurable via DELIVERY_DAYS_OFFSET env var,
      dynamically adjusted per garment type - e.g. Woolen = 5 days).
- [x] MongoDB persistence (Atlas in production).
- [x] Search by garment type (filter dropdown).
- [x] Swagger UI auto-generated API documentation.
- [x] Deployed backend (Render) + frontend (Vercel).
- [x] Jest test suite (6 tests, in-memory MongoDB, no real DB required).
- [x] Postman collection with auto-token injection.

## 🗂️ Folder Structure

<details>
	<summary>Full folder tree</summary>

```
laundry-system/
├── backend/
│   ├── src/
│   │   ├── config/          # db.ts, env.ts, swagger.json
│   │   ├── constants/       # garments.ts (price catalog), db.ts
│   │   ├── controllers/     # auth, order, dashboard controllers
│   │   ├── middleware/      # auth, error, validate middleware
│   │   ├── models/          # Order.model.ts (Mongoose schema)
│   │   ├── routes/          # auth, order, dashboard, docs routes
│   │   ├── services/        # auth, order, dashboard, billing services
│   │   ├── types/           # Shared TypeScript interfaces
│   │   └── utils/           # appError, generateOrderId, logger
│   ├── tests/               # order.test.ts (Jest + Supertest)
│   ├── server.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client with interceptors
│   │   ├── components/      # CreateOrderForm, OrderTable, StatusBadge,
│   │   │                    # DashboardStats, FilterBar
│   │   ├── constants/       # garments.ts (catalog mirror)
│   │   ├── hooks/           # useOrders (TanStack Query)
│   │   ├── pages/           # LandingPage, LoginPage, DashboardPage, OrdersPage
│   │   └── types/           # index.ts (shared interfaces)
│   └── package.json
├── postman/
│   └── laundry-system.postman_collection.json
└── README.md
```

</details>

## 📦 Setup

### Prerequisites

- Node.js 18 or newer.
- MongoDB local instance or Atlas connection string.
- npm (or pnpm/yarn if you prefer, but commands below use npm).

### Backend

```bash
cd laundry-system/backend
npm install
npm run dev
```

Backend runs at:

- http://localhost:5000

Swagger UI:

- http://localhost:5000/api/docs

Swagger JSON:

- http://localhost:5000/api/docs/swagger.json

### Frontend

```bash
cd laundry-system/frontend
npm install
npm run dev
```

Frontend runs at:

- http://localhost:5173

### Optional frontend env

Create a file at frontend/.env.local:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🔐 Authentication

Admin-only access is enforced on all protected routes.

Login uses hardcoded credentials from environment variables.

Default local credentials:

- admin / admin123

JWT is stored in localStorage and attached to every API call.

## 🔧 Environment Variables

### Backend (.env)

| Variable             | Example                                  | Description                   |
| -------------------- | ---------------------------------------- | ----------------------------- |
| PORT                 | 5000                                     | Backend port.                 |
| MONGODB_URI          | mongodb://localhost:27017/laundry-system | Mongo connection string.      |
| JWT_SECRET           | your_super_secret_key_here               | JWT signing secret.           |
| JWT_EXPIRES_IN       | 24h                                      | Token expiry time.            |
| DELIVERY_DAYS_OFFSET | 2                                        | Base delivery offset in days. |
| ADMIN_USERNAME       | admin                                    | Admin username.               |
| ADMIN_PASSWORD       | admin123                                 | Admin password.               |
| NODE_ENV             | development                              | Runtime environment.          |
| CORS_ORIGIN          | http://localhost:5173                    | Frontend origin for CORS.     |

### Frontend (.env.local) - optional

| Variable          | Example                   | Description           |
| ----------------- | ------------------------- | --------------------- |
| VITE_API_BASE_URL | http://localhost:5000/api | Backend API base URL. |

## 🧭 API Reference

| Method | Endpoint                    | Auth      | Description               |
| ------ | --------------------------- | --------- | ------------------------- |
| POST   | /api/auth/login             | No auth   | Login, returns JWT.       |
| POST   | /api/orders                 | Protected | Create order.             |
| GET    | /api/orders                 | Protected | List + filter + paginate. |
| GET    | /api/orders/:orderId        | Protected | Get single order.         |
| PATCH  | /api/orders/:orderId/status | Protected | Advance order status.     |
| GET    | /api/dashboard              | Protected | Revenue + order stats.    |
| GET    | /api/docs                   | Public    | Swagger UI.               |
| GET    | /health                     | Public    | Health check.             |

## 🧠 Business Logic Highlights

1. Garment price catalog
   is hardcoded on the server.
   Prices are copied into the order document on creation,
   so price changes never affect historical orders.

2. Order ID format
   is ORD-YYYYMMDD-XXXX,
   where XXXX are the last 4 hex chars of the Mongo ObjectId.
   This is human-readable and avoids collisions without a counter.

3. Status transition rules
   enforce a strict flow:
   RECEIVED -> PROCESSING -> READY -> DELIVERED.
   Any non-adjacent transition returns 400 VALIDATION_ERROR.

4. Estimated delivery date
   takes the maximum of:
   the base DELIVERY_DAYS_OFFSET and
   the garment-specific delivery map.
   Example: Woolen (5 days) + Shirt (1 day)
   yields now + 5 days.

5. Dashboard daily stats
   are calculated using UTC day boundaries
   to avoid timezone drift.

## 🧪 Testing

Backend tests use Jest, Supertest, and mongodb-memory-server.

```bash
cd laundry-system/backend
npm test
```

Tests covered:

- Order creation happy path.
- Invalid garment name.
- Invalid phone number.
- Forward status transition.
- Backward status transition rejection.
- Dashboard response shape.

## 🚀 Deployment

### Backend on Render

- Service type: Web Service.
- Root directory: backend.
- Build command: npm install --include=dev && npm run build.
- Start command: npm run start.

Required env vars:

- MONGODB_URI
- DB_NAME
- JWT_SECRET
- JWT_EXPIRES_IN
- DELIVERY_DAYS_OFFSET
- ADMIN_USERNAME
- ADMIN_PASSWORD
- NODE_ENV=production
- CORS_ORIGIN=https://<your-project>.vercel.app

### Frontend on Vercel

- Root directory: frontend.
- Build command: npm install && npm run build.
- Output directory: dist.
- SPA rewrites: handled by frontend/vercel.json.

Frontend env vars:

- VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api

## 📮 Postman

Import the Postman collection:

- postman/laundry-system.postman_collection.json

The login request auto-stores the JWT token for all protected routes.

## 🤖 AI Usage

<details>
	<summary>AI Usage Report</summary>

### Tools used

- Claude (Anthropic) - primary scaffold + iteration.
- Copilot - in-editor autocomplete while fixing issues.

### Sample prompts used

Prompt 1 - initial scaffold:

"Build a complete Node.js + Express + TypeScript backend for a laundry order
management system.
Include order creation with a garment price catalog,
JWT auth, status transitions, pagination, and a dashboard endpoint.
Use mongoose, express-validator, pino logger,
and follow clean architecture with controllers, services, and routes separated."

Prompt 2 - test generation:

"Write Jest + Supertest tests for my Express app using mongodb-memory-server.
Cover: happy path order creation, invalid garment name, invalid phone number,
forward status transition, backward status transition rejection,
and dashboard response shape."

Prompt 3 - frontend scaffold:

"Build a React 18 + Vite + TailwindCSS frontend for this laundry system.
Pages: Login, Dashboard (stats cards, auto-refresh 30s), Orders (table with
filters, search, pagination, inline status update, create order modal with
real-time total calculation).
Use TanStack Query for data fetching,
React Hook Form + Zod for forms,
React Router v6."

Prompt 4 - deployment fix:

"My Express app deployed on Render fails with CORS errors when called from
my Vercel frontend.
The CORS_ORIGIN env var is set.
Show me how to debug this and what to check in the helmet + cors middleware setup."

### What AI got wrong

Issue 1 - Generated JavaScript instead of TypeScript in the first attempt.

- Controllers lacked explicit Request/Response typings.
- The tsconfig used CommonJS without considering Node16 resolution.

Fix:

- Rewrote tsconfig with module: Node16 + moduleResolution: node16.
- Added explicit Request/Response types to all handlers.

Issue 2 - Status transition logic was incorrect.

- AI allowed jumping from RECEIVED to READY.
- It checked nextIndex > currentIndex instead of strict adjacency.

Fix:

- Replaced with strict adjacency check (nextIndex !== currentIndex + 1).

Issue 3 - Test setup used a real MongoDB connection.

- Tests attempted to connect using the production URI.
- CI failed because no database was available.

Fix:

- Removed connectDb() from tests.
- Connected mongoose directly to mongodb-memory-server in beforeAll.

Issue 4 - Swagger generation was scattered across routes.

- AI used JSDoc + swagger-jsdoc in route files.
- This caused import and circular reference issues.

Fix:

- Replaced with a single static swagger.json.
- Served directly via swagger-ui-express at /api/docs.

### What was manually improved

- Estimated delivery date moved from a flat +2 days to
  a garment-specific maximum-based system.
- Frontend design replaced generic gray cards with
  a warm palette, custom fonts, and glass-like surfaces.
- generateOrderId switched from a random 4-digit number
  to the last 4 hex chars of the MongoDB ObjectId.
- Axios interceptor now clears tokens on 401 responses.

</details>

## ⚖️ Tradeoffs & What I'd Improve

### Deliberately skipped

- Role-based auth: only one admin role was needed for scope.
- Refresh tokens: JWT expiry is 24h; refresh rotation adds complexity.
- Rate limiting: left out to keep middleware chain lean for the assignment.
- SMS/email notifications: out of scope, but a natural add-on later.

### Would improve with more time

- Add a Users collection with bcrypt-hashed passwords.
- Implement optimistic UI updates on status changes.
- Add audit logs for every status transition.
- Add frontend tests using Vitest + Testing Library.
- Use WebSockets for real-time updates instead of polling.
- Add a pricing management UI for store owners.

## 🌐 Live Demo

- Backend: https://dry-clean-laundary.onrender.com
- Frontend: https://dry-clean-laundary.vercel.app/
- Swagger: https://dry-clean-laundary.onrender.com/api/docs

Note: Render free-tier services may cold-start on first request.
Allow up to 30 seconds for the initial response.
