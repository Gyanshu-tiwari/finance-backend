# Finance Dashboard Backend

A RESTful backend API for a multi-role finance dashboard system. Built with **Node.js**, **Express**, and **SQLite** (via `better-sqlite3`). Supports financial record management, role-based access control, dashboard analytics, and a full audit trail.

> 📄 **Interactive API Docs (Swagger UI):** [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Default Credentials](#default-credentials)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Financial Records](#financial-records)
  - [Dashboard](#dashboard)
  - [Audit Logs](#audit-logs)
  - [System](#system)
- [Interactive API Docs (Swagger)](#interactive-api-docs-swagger)
- [Role-Based Access Control](#role-based-access-control)
- [Data Models](#data-models)
- [Architecture & Design Decisions](#architecture--design-decisions)
- [Assumptions & Tradeoffs](#assumptions--tradeoffs)
- [Features Summary](#features-summary)

---

## Overview

This project implements the backend for a finance dashboard where users interact with financial records based on their assigned role. The system supports:

- Secure JWT-based authentication
- Three-tier role model: `viewer`, `analyst`, `admin`
- Full CRUD for financial records (income/expense)
- Dashboard aggregation APIs (totals, trends, categories, recent activity)
- Automatic audit logging of all write operations
- Input validation, structured errors, and rate limiting

---

## Tech Stack

| Layer              | Technology                          |
|--------------------|-------------------------------------|
| Runtime            | Node.js v18+ (ESM modules)          |
| Framework          | Express v5                          |
| Database           | SQLite via `better-sqlite3`         |
| Authentication     | JSON Web Tokens (`jsonwebtoken`)    |
| Validation         | Joi                                 |
| Password Hashing   | bcryptjs                            |
| Security           | Helmet, CORS, express-rate-limit    |
| Logging            | Morgan                              |
| Dev Server         | Nodemon                             |

---

## Project Structure

```
finance_Dashboard_backend/
├── server.js                    # Entry point — starts HTTP server with graceful shutdown
├── .env                         # Environment variables (see .env.example)
├── finance.db                   # SQLite database file (auto-created on first run)
│
└── src/
    ├── app.js                   # Express app setup (middleware, routes, error handler)
    │
    ├── config/
    │   ├── database.js          # DB connection, schema creation, indexes, admin seed
    │   └── seed.js              # Optional additional seed data script
    │
    ├── routes/
    │   ├── auth.js              # POST /api/auth/register, login
    │   ├── users.js             # GET/PUT/PATCH/DELETE /api/users
    │   ├── records.js           # CRUD + export /api/records
    │   ├── dashboard.js         # Analytics /api/dashboard
    │   ├── audit.js             # GET /api/audit-logs
    │   └── docs.js              # GET /api/docs (self-documenting)
    │
    ├── controllers/             # Route handlers — parse req/res, delegate to services
    │   ├── authController.js
    │   ├── userController.js
    │   ├── recordController.js
    │   ├── dashboardController.js
    │   └── auditController.js
    │
    ├── services/                # Business logic layer
    │   ├── authService.js       # register, login, token issuance
    │   ├── userService.js       # user CRUD, status management
    │   ├── recordService.js     # financial record operations
    │   ├── dashboardService.js  # analytics aggregation
    │   └── auditService.js      # audit log writing and querying
    │
    ├── models/                  # Database access layer (SQL queries)
    │   ├── User.js
    │   ├── Record.js
    │   └── AuditLog.js
    │
    ├── middleware/
    │   ├── auth.js              # JWT verification → req.user
    │   ├── rbac.js              # Role-based authorization guard
    │   ├── validate.js          # Joi body/query validation
    │   └── errorHandler.js      # Global error response formatter
    │
    ├── validators/
    │   └── schemas.js           # All Joi schemas (register, login, createRecord, etc.)
    │
    └── utils/
        ├── errors.js            # Custom error classes (ValidationError, NotFoundError, etc.)
        └── response.js          # Standardized JSON response helpers
```

---

## Getting Started

### Prerequisites

- Node.js **v18 or higher**
- npm

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd finance_Dashboard_backend

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Edit .env and set JWT_SECRET to a strong random string

# 4. Start the development server
npm run dev
```

The server starts on `http://localhost:3000`. The SQLite database and all tables are **created automatically** on first run. A default admin account is seeded if one does not exist.

### Scripts

| Command          | Description                                    |
|------------------|------------------------------------------------|
| `npm run dev`    | Start with nodemon (auto-restart on changes)   |
| `npm start`      | Start in production mode                       |
| `npm run seed`   | Run additional seed data (optional)            |

---

## Environment Variables

Create a `.env` file in the project root (or copy from `.env.example`):

```env
PORT=3000
NODE_ENV=development

# JWT — change JWT_SECRET to a long random string in production
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Password hashing cost (10 is fine for dev; use 12 in production)
BCRYPT_SALT_ROUNDS=10

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000   # 15 minutes
RATE_LIMIT_MAX=100             # Max requests per window (non-auth routes)
AUTH_RATE_LIMIT_MAX=10         # Max requests per window (auth routes)

# CORS — use specific origin(s) in production
ALLOWED_ORIGINS=*
```

---

## Default Credentials

A default admin account is automatically created on first run:

| Field      | Value                |
|------------|----------------------|
| Email      | `admin@example.com`  |
| Password   | `admin123`           |
| Role       | `admin`              |

> ⚠️ Change this password immediately in any shared or production environment.

---

## API Reference

All protected routes require an `Authorization: Bearer <token>` header.

### Authentication

#### `POST /api/auth/register`
Create a new user account.

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword",
  "role": "analyst"
}
```
> `role` is optional — defaults to `"viewer"`. Allowed: `"viewer"`, `"analyst"`, `"admin"`.

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "analyst" }
  }
}
```

---

#### `POST /api/auth/login`
Authenticate and receive a token.

**Request body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": "...", "name": "System Admin", "role": "admin" }
  }
}
```

---

### Users

> 🔒 All user management endpoints require **Admin** role.

| Method     | Path                      | Description                                     |
|------------|---------------------------|-------------------------------------------------|
| `GET`      | `/api/users`              | List all users                                  |
| `GET`      | `/api/users/:id`          | Get user by ID                                  |
| `PUT`      | `/api/users/:id`          | Update user name, email, or role                |
| `PATCH`    | `/api/users/:id/status`   | Set user status (`active` / `inactive`)         |
| `DELETE`   | `/api/users/:id`          | Deactivate user and soft-delete their records   |

**`PUT /api/users/:id` body:**
```json
{
  "name": "Updated Name",
  "email": "new@example.com",
  "role": "analyst"
}
```

**`PATCH /api/users/:id/status` body:**
```json
{ "status": "inactive" }
```

---

### Financial Records

| Method     | Path                    | Access                  | Description                           |
|------------|-------------------------|-------------------------|---------------------------------------|
| `POST`     | `/api/records`          | Admin                   | Create a record                       |
| `GET`      | `/api/records`          | Admin, Analyst, Viewer  | List records (filterable, paginated)  |
| `GET`      | `/api/records/export`   | Admin, Analyst          | Export records as CSV                 |
| `GET`      | `/api/records/:id`      | Admin, Analyst, Viewer  | Get a single record                   |
| `PUT`      | `/api/records/:id`      | Admin                   | Update a record                       |
| `DELETE`   | `/api/records/:id`      | Admin                   | Soft-delete a record                  |

#### `POST /api/records` — Create

**Request body:**
```json
{
  "amount": 50000,
  "type": "income",
  "category": "Salary",
  "date": "2025-04-01",
  "description": "Monthly salary for April"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "amount": 50000,
    "type": "income",
    "category": "Salary",
    "date": "2025-04-01",
    "description": "Monthly salary for April",
    "created_by": "user-id",
    "created_at": "2025-04-01T00:00:00"
  }
}
```

#### `GET /api/records` — List with Filters

**Query parameters:**

| Parameter    | Type                    | Description                               |
|--------------|-------------------------|-------------------------------------------|
| `type`       | `income` \| `expense`   | Filter by record type                     |
| `category`   | string                  | Filter by category (exact match)          |
| `date_from`  | ISO date string         | Filter records on or after this date      |
| `date_to`    | ISO date string         | Filter records on or before this date     |
| `search`     | string                  | Search description and category           |
| `page`       | integer                 | Page number (default: 1)                  |
| `limit`      | integer                 | Records per page, max 100 (default: 10)   |

**Example:**
```
GET /api/records?type=income&date_from=2025-01-01&date_to=2025-12-31&page=1&limit=20
```

**Response `200`:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 48,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### Dashboard

> 🔒 Summary, categories, trends — **Admin, Analyst** only. Recent — all roles.

| Endpoint                           | Description                                              |
|------------------------------------|----------------------------------------------------------|
| `GET /api/dashboard/summary`       | Total income, total expenses, net balance, record count  |
| `GET /api/dashboard/categories`    | Amount and count grouped by category and type            |
| `GET /api/dashboard/trends`        | Monthly totals grouped by type (income/expense)          |
| `GET /api/dashboard/recent?limit=N`| N most recent records (default: 10)                      |

**`GET /api/dashboard/summary` response:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 250000,
    "totalExpenses": 87500,
    "netBalance": 162500,
    "recordCount": 24
  }
}
```

**`GET /api/dashboard/trends` response:**
```json
{
  "success": true,
  "data": [
    { "month": "2025-01", "type": "income", "total": 50000 },
    { "month": "2025-01", "type": "expense", "total": 18000 },
    { "month": "2025-02", "type": "income", "total": 50000 }
  ]
}
```

---

### Audit Logs

> 🔒 **Admin** only.

#### `GET /api/audit-logs`

Every create, update, and delete action in the system is automatically recorded.

**Query parameters:** `user_id`, `action`, `resource`, `page`, `limit`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "user_id": "...",
      "action": "CREATE",
      "resource": "financial_record",
      "resource_id": "record-id",
      "details": "{\"amount\":50000,\"type\":\"income\"}",
      "created_at": "2025-04-01T12:00:00"
    }
  ],
  "pagination": { ... }
}
```

---

### System

| Endpoint          | Access  | Description                                |
|-------------------|---------|--------------------------------------------|
| `GET /api/health` | Public  | Server health, DB status, memory, uptime   |
| `GET /api/docs`   | Public  | JSON API documentation                     |

**`GET /api/health` response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-04-01T12:00:00.000Z",
  "uptime": 3612.4,
  "database": "connected",
  "memory": { "used": "42 MB", "total": "65 MB" }
}
```

---

## Interactive API Docs (Swagger)

The API ships with a fully interactive **Swagger UI** powered by `swagger-jsdoc` and `swagger-ui-express`.

| URL | Description |
|-----|-------------|
| [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs) | Swagger UI — browse and test all endpoints |
| [`http://localhost:3000/api-docs.json`](http://localhost:3000/api-docs.json) | Raw OpenAPI 3.0 spec (JSON) |

### How to authenticate in Swagger UI

1. Call `POST /api/auth/login` with the default credentials to obtain a JWT token.
2. Click the **Authorize 🔒** button at the top right of the Swagger UI page.
3. Paste the token in the `BearerAuth` field and click **Authorize**.
4. All subsequent requests will include the `Authorization: Bearer <token>` header automatically.

---

## Role-Based Access Control

| Action                       | Viewer | Analyst | Admin |
|------------------------------|--------|---------|-------|
| Login / Register             | ✅     | ✅      | ✅    |
| View records (GET)           | ✅     | ✅      | ✅    |
| View dashboard/recent        | ✅     | ✅      | ✅    |
| Dashboard summary & trends   | ❌     | ✅      | ✅    |
| Export records (CSV)         | ❌     | ✅      | ✅    |
| Create records               | ❌     | ❌      | ✅    |
| Update / Delete records      | ❌     | ❌      | ✅    |
| User management              | ❌     | ❌      | ✅    |
| View audit logs              | ❌     | ❌      | ✅    |

---

## Data Models

### `users`
| Column          | Type        | Notes                                        |
|-----------------|-------------|----------------------------------------------|
| `id`            | TEXT (UUID) | Primary key                                  |
| `name`          | TEXT        | Required                                     |
| `email`         | TEXT        | Unique                                       |
| `password_hash` | TEXT        | bcrypt hashed                                |
| `role`          | TEXT        | `viewer` \| `analyst` \| `admin`             |
| `status`        | TEXT        | `active` \| `inactive`                       |
| `created_at`    | DATETIME    | Auto                                         |
| `updated_at`    | DATETIME    | Auto                                         |

### `financial_records`
| Column          | Type        | Notes                                        |
|-----------------|-------------|----------------------------------------------|
| `id`            | TEXT (UUID) | Primary key                                  |
| `amount`        | REAL        | Must be > 0                                  |
| `type`          | TEXT        | `income` \| `expense`                        |
| `category`      | TEXT        | Required                                     |
| `date`          | TEXT        | ISO date string (`YYYY-MM-DD`)               |
| `description`   | TEXT        | Optional                                     |
| `created_by`    | TEXT        | FK → `users.id`                              |
| `is_deleted`    | INTEGER     | `0` = active, `1` = soft-deleted             |
| `created_at`    | DATETIME    | Auto                                         |
| `updated_at`    | DATETIME    | Auto                                         |

### `audit_logs`
| Column          | Type        | Notes                                        |
|-----------------|-------------|----------------------------------------------|
| `id`            | TEXT (UUID) | Primary key                                  |
| `user_id`       | TEXT        | Who performed the action                     |
| `action`        | TEXT        | `CREATE`, `UPDATE`, `DELETE`, `UPDATE_STATUS`|
| `resource`      | TEXT        | e.g. `financial_record`, `user`              |
| `resource_id`   | TEXT        | ID of the affected entity                    |
| `details`       | TEXT        | JSON-serialized change payload               |
| `ip_address`    | TEXT        | Optional — reserved for future use           |
| `created_at`    | DATETIME    | Auto                                         |

---

## Architecture & Design Decisions

### Layered Architecture
The application follows a strict **Route → Controller → Service → Model** pattern:
- **Routes** define URL paths, apply middleware (auth, RBAC, validation), and delegate to controllers
- **Controllers** handle HTTP concerns only (parse req, send res, call next on error)
- **Services** contain all business logic and enforce domain rules
- **Models** contain raw SQL — the only layer that touches the database

This makes each layer independently testable and easy to replace.

### Synchronous SQLite (`better-sqlite3`)
SQLite with `better-sqlite3` was chosen for its simplicity, zero configuration, and excellent performance for single-server deployments. The synchronous API eliminates callback/promise complexity while WAL mode (`PRAGMA journal_mode = WAL`) provides good concurrent read performance.

### JWT Authentication
Tokens are stateless and signed with `HS256`. The token payload includes `userId` and `role`, which means role changes take effect only after the current token expires. For a production system, a token revocation store (Redis blacklist) would address this.

### Soft Deletes
Both records and users are soft-deleted (`is_deleted = 1` / `status = inactive`) rather than hard-deleted. This preserves audit history and allows recovery.

### Audit Trail
Every write operation (CREATE, UPDATE, DELETE) is automatically logged by the service layer — not the controller — ensuring no action can bypass logging regardless of how it's invoked.

---

## Assumptions & Tradeoffs

| Assumption / Tradeoff                                | Reasoning                                                                                                                                                               |
|------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| SQLite instead of PostgreSQL/MySQL                   | Zero-config, file-based, ideal for assessment — trivial to swap out by replacing the `database.js` config and switching from `better-sqlite3` to a promise-based driver |
| Synchronous DB calls                                 | `better-sqlite3` is synchronous by design; this is a feature, not a tradeoff — it avoids async complexity without sacrificing correctness                               |
| Role assigned at registration                        | Any role can be assigned at signup for flexibility during development/testing. In production, only admins should be able to assign `admin`/`analyst` roles               |
| Dates stored as ISO strings                          | SQLite has no native DATE type. Storing as `TEXT` in `YYYY-MM-DD` format is the standard pattern and works correctly with SQLite's `strftime()` and string comparison operators |
| No refresh tokens                                    | Token expiry is fixed at 24 hours. A production system would add refresh tokens and a revocation mechanism                                                              |
| Password hashing is synchronous (`bcrypt.hashSync`) | Acceptable in a synchronous codebase using `better-sqlite3`. An async framework (PostgreSQL + async drivers) would use the async bcrypt variants                       |
| Audit log IP address not captured                    | Reserved column for future use — would require extracting it from `req.ip` in the controller layer                                                                      |

---

## Features Summary

- ✅ JWT Authentication (register, login)
- ✅ Three-role RBAC (viewer, analyst, admin)
- ✅ Financial records CRUD with soft delete
- ✅ Advanced filtering (type, category, date range, full-text search)
- ✅ Pagination with full metadata
- ✅ Dashboard analytics (summary, category breakdown, monthly trends, recent activity)
- ✅ CSV export
- ✅ Automatic audit logging
- ✅ Joi input validation on all endpoints
- ✅ Centralized error handling with custom error classes
- ✅ Rate limiting (global + strict auth limiter)
- ✅ Security headers (Helmet)
- ✅ CORS support
- ✅ Health check endpoint
- ✅ Self-documenting API (`GET /api/docs`)
- ✅ Graceful shutdown (SIGTERM / SIGINT)
- ✅ SQLite with WAL mode, FK constraints, and indexes
