# FreshStore — Backend (Node.js / Express)

> REST API server for the FreshStore food store management system. Handles authentication, data persistence, business logic, and aggregated statistics.

---

## Overview

The backend is a **Node.js + Express** application that exposes a JSON REST API consumed by the React frontend. It connects to a **MongoDB** database via Mongoose and secures all data routes with **JWT authentication**.

---

## Folder Structure

```
Backend/
├── index.js                  ← App entry point — mounts middleware and routes
├── package.json
├── .env.example              ← Copy to .env and fill in your values
│
├── config/
│   └── db.js                 ← Mongoose connection (called once at startup)
│
├── models/
│   ├── User.js               ← User schema: name, email, hashed password, role
│   └── Entry.js              ← Entry schema: item, qty, price, type, date, notes
│
├── controllers/
│   ├── authController.js     ← register(), login(), getMe()
│   └── entryController.js    ← createEntry(), getEntries(), getEntry(),
│                                updateEntry(), deleteEntry(),
│                                getDashboardStats(), getReportStats()
│
├── routes/
│   ├── auth.js               ← /api/auth routes with express-validator rules
│   └── entries.js            ← /api/entries routes with express-validator rules
│
└── middleware/
    └── auth.js               ← protect() — verifies JWT, attaches req.user
```

---

## Setup

### 1. Install dependencies

```bash
cd Backend
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

| Variable      | Required | Default                                | Description                    |
| ------------- | -------- | -------------------------------------- | ------------------------------ |
| `PORT`        | No       | `5000`                                 | Port the server listens on     |
| `MONGODB_URI` | Yes      | `mongodb://localhost:27017/freshstore` | MongoDB connection string      |
| `JWT_SECRET`  | Yes      | —                                      | Secret used to sign JWT tokens |
| `JWT_EXPIRE`  | No       | `7d`                                   | How long tokens stay valid     |
| `NODE_ENV`    | No       | `development`                          | `development` or `production`  |
| `CLIENT_URL`  | No       | `http://localhost:5173`                | Allowed CORS origin            |

### 3. Run

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

Server starts at: **http://localhost:5000**

---

## API Reference

### Base URL

```
http://localhost:5000/api
```

### Health check

```
GET /api/health
```

Returns `{ status: "ok", timestamp: "..." }` — useful for confirming the server is running.

---

### Authentication Routes

All auth routes are public (no token required).

#### Register

```
POST /api/auth/register
```

**Request body:**

```json
{
  "name": "Jane Wanjiku",
  "email": "jane@example.com",
  "password": "securepass123"
}
```

**Success response `201`:**

```json
{
  "success": true,
  "token": "<jwt>",
  "user": {
    "id": "...",
    "name": "Jane Wanjiku",
    "email": "jane@example.com",
    "role": "manager"
  }
}
```

---

#### Login

```
POST /api/auth/login
```

**Request body:**

```json
{
  "email": "jane@example.com",
  "password": "securepass123"
}
```

**Success response `200`:**

```json
{
  "success": true,
  "token": "<jwt>",
  "user": {
    "id": "...",
    "name": "Jane Wanjiku",
    "email": "jane@example.com",
    "role": "manager"
  }
}
```

---

#### Get current user

```
GET /api/auth/me
Authorization: Bearer <token>
```

**Success response `200`:**

```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "Jane Wanjiku",
    "email": "jane@example.com",
    "role": "manager"
  }
}
```

---

### Entry Routes

All entry routes require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

#### List entries

```
GET /api/entries
```

**Query parameters (all optional):**

| Param       | Type   | Description                       |
| ----------- | ------ | --------------------------------- |
| `type`      | string | `stock` or `sale`                 |
| `itemName`  | string | Partial match (case-insensitive)  |
| `startDate` | string | ISO date — filter from this date  |
| `endDate`   | string | ISO date — filter up to this date |
| `page`      | number | Page number (default: `1`)        |
| `limit`     | number | Results per page (default: `50`)  |

**Success response `200`:**

```json
{
  "success": true,
  "count": 10,
  "total": 42,
  "pages": 5,
  "currentPage": 1,
  "data": [ ...entries ]
}
```

---

#### Create entry

```
POST /api/entries
```

**Request body:**

```json
{
  "itemName": "Mangoes",
  "quantity": 50,
  "pricePerUnit": 100,
  "type": "stock",
  "date": "2026-04-22",
  "notes": "Supplier: Wakulima Market"
}
```

**Validation rules:**

| Field          | Rule                                |
| -------------- | ----------------------------------- |
| `itemName`     | Required, max 100 characters        |
| `quantity`     | Required, must be > 0               |
| `pricePerUnit` | Required, must be >= 0              |
| `type`         | Required, must be `stock` or `sale` |
| `date`         | Optional, ISO 8601 format           |

**Success response `201`:**

```json
{
  "success": true,
  "data": { ...entry }
}
```

> `totalValue` is automatically calculated as `quantity × pricePerUnit` by a Mongoose pre-save hook.

---

#### Get single entry

```
GET /api/entries/:id
```

**Success response `200`:**

```json
{
  "success": true,
  "data": { ...entry }
}
```

---

#### Update entry

```
PUT /api/entries/:id
```

Same body rules as create. Returns updated entry.

---

#### Delete entry

```
DELETE /api/entries/:id
```

**Success response `200`:**

```json
{
  "success": true,
  "message": "Entry deleted"
}
```

---

#### Dashboard statistics

```
GET /api/entries/stats/dashboard
```

Returns aggregated stats used by the dashboard page.

**Success response `200`:**

```json
{
  "success": true,
  "data": {
    "allTime": {
      "totalStockValue": 84200,
      "totalSalesValue": 32750,
      "totalStockQty": 320,
      "totalSalesQty": 145,
      "stockEntries": 12,
      "saleEntries": 6
    },
    "today": {
      "stockValue": 0,
      "salesValue": 6450,
      "stockQty": 0,
      "salesQty": 50
    },
    "inventory": [
      { "_id": "Mangoes", "stockQty": 50, "soldQty": 20, "currentStock": 30 }
    ],
    "lowStockItems": [
      { "_id": "Spinach", "currentStock": 3 }
    ],
    "recentEntries": [ ...last 10 entries ]
  }
}
```

---

#### Report statistics

```
GET /api/entries/stats/report
```

**Query parameters (all optional):** `type`, `startDate`, `endDate`

Returns per-item grouped aggregations and overall totals for the reports page.

**Success response `200`:**

```json
{
  "success": true,
  "data": {
    "summary": [
      {
        "_id": { "item": "Mangoes", "type": "stock" },
        "totalQty": 50,
        "totalValue": 5000,
        "avgPrice": 100,
        "entryCount": 1
      }
    ],
    "totals": [
      { "_id": "stock", "totalQty": 320, "totalValue": 84200, "count": 12 }
    ]
  }
}
```

---

## Data Models

### User

| Field       | Type   | Notes                                                                     |
| ----------- | ------ | ------------------------------------------------------------------------- |
| `name`      | String | Required, max 50 chars                                                    |
| `email`     | String | Required, unique, lowercase                                               |
| `password`  | String | Required, hashed with bcrypt (×12 salt rounds), never returned in queries |
| `role`      | String | `manager` (default) or `admin`                                            |
| `createdAt` | Date   | Auto                                                                      |
| `updatedAt` | Date   | Auto                                                                      |

### Entry

| Field          | Type     | Notes                                    |
| -------------- | -------- | ---------------------------------------- |
| `itemName`     | String   | Required, max 100 chars                  |
| `quantity`     | Number   | Required, must be > 0                    |
| `pricePerUnit` | Number   | Required, must be >= 0                   |
| `totalValue`   | Number   | Auto-calculated: `qty × price`           |
| `type`         | String   | `stock` or `sale`                        |
| `date`         | Date     | Required, defaults to now                |
| `notes`        | String   | Optional, max 500 chars                  |
| `createdBy`    | ObjectId | Ref to User — all queries scoped to this |
| `createdAt`    | Date     | Auto                                     |

**Indexes:** `date`, `type`, `itemName`, `createdBy` — for fast filtering.

---

## Security

- Passwords are hashed with **bcrypt** (12 salt rounds) via a Mongoose `pre('save')` hook — plain text is never stored
- JWTs are signed with `JWT_SECRET` and expire after `JWT_EXPIRE`
- The `password` field has `select: false` — it is never included in query results unless explicitly selected
- All entry queries are scoped to `createdBy: req.user._id` — users only see their own data
- CORS is restricted to `CLIENT_URL`

---

## Error Responses

All errors follow this shape:

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

Validation errors return an `errors` array:

```json
{
  "success": false,
  "errors": [{ "field": "email", "message": "Valid email is required" }]
}
```

| Status | Meaning                         |
| ------ | ------------------------------- |
| `400`  | Validation error or bad request |
| `401`  | Missing or invalid JWT token    |
| `404`  | Resource not found              |
| `500`  | Internal server error           |

---

## Dependencies

| Package             | Purpose                                |
| ------------------- | -------------------------------------- |
| `express`           | HTTP server and routing                |
| `mongoose`          | MongoDB ODM                            |
| `bcryptjs`          | Password hashing                       |
| `jsonwebtoken`      | JWT creation and verification          |
| `express-validator` | Request body validation                |
| `cors`              | Cross-origin resource sharing          |
| `dotenv`            | Load environment variables from `.env` |
| `nodemon` (dev)     | Auto-restart server on file changes    |
