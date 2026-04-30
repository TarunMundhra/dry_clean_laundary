# Mini Laundry Order Management System

A production-ready dry cleaning order manager with a Node.js + Express API and a React + Vite dashboard.

## Project structure

- backend: Express + TypeScript + MongoDB API
- frontend: React 18 + Vite + TailwindCSS UI
- postman: Ready-to-run Postman collection

## Backend setup

1. Copy environment file and adjust values.
2. Install dependencies and run the API.

```bash
cd backend
npm install
npm run dev
```

API runs at http://localhost:5000
Swagger UI: http://localhost:5000/api/docs
Swagger JSON: http://localhost:5000/api/docs/swagger.json

### Run backend tests

```bash
cd backend
npm test
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

### Optional frontend env

Set API base URL if needed:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Admin credentials

- Username: admin
- Password: admin123

## Postman

Import [postman/laundry-system.postman_collection.json](postman/laundry-system.postman_collection.json) into Postman.
