# FreshStore — Food Store Management System

> A full-stack web application for managing a small food store's stock, sales, dashboard insights, and reports. Built as a two-stage practical assignment: **Stage 1** (Figma wireframes) → **Stage 2** (working Node.js + React application).

---

## Project Overview

FreshStore helps a store owner or manager:

- Record **stock deliveries** and **sales transactions**
- Monitor **live inventory levels** with low-stock alerts
- View a **dashboard** with summary cards and recent activity
- Generate **filtered reports** and export them as CSV
- Secure all data behind **JWT authentication**

---

## Repository Structure

```
freshstore/                              ← Root (this README)
├── package.json                         ← Root scripts — runs both Backend + Frontend
├── README.md                            ← You are here
│
├── Backend/                              ← Node.js + Express backend
│   ├── README.md                        ← Backend-specific documentation
│   ├── .env.example                     ← Environment variable template
│   ├── index.js                         ← Express entry point
│   ├── package.json
│   ├── config/
│   │   └── db.js                        ← MongoDB connection
│   ├── models/
│   │   ├── User.js                      ← User schema (bcrypt hashing)
│   │   └── Entry.js                     ← Stock/sale entry schema
│   ├── controllers/
│   │   ├── authController.js            ← Register, login, get-me
│   │   └── entryController.js           ← CRUD + dashboard + report aggregations
│   ├── routes/
│   │   ├── auth.js                      ← Auth routes
│   │   └── entries.js                   ← Entry routes
│   └── middleware/
│       └── auth.js                      ← JWT protect middleware
│
└── Frontend/                              ← React + Vite frontend
    ├── README.md                        ← Frontend-specific documentation
    ├── index.html
    ├── vite.config.js                   ← Dev server + API proxy
    ├── package.json
    └── src/
        ├── App.jsx                      ← Router + route definitions
        ├── main.jsx                     ← React DOM entry point
        ├── index.css                    ← Global CSS variables + base styles
        ├── context/
        │   ├── AuthContext.jsx          ← Auth state provider
        │   └── useAuth.js               ← useAuth hook
        ├── services/
        │   ├── api.js                   ← Axios instance + 401 interceptor
        │   └── entries.js               ← Entry API calls
        ├── components/
        │   ├── Layout.jsx + Layout.css
        │   ├── ProtectedRoute.jsx
        │   └── UI.jsx + UI.css
        └── pages/
            ├── Login.jsx + Login.css
            ├── Dashboard.jsx + Dashboard.css
            ├── EntryForm.jsx + EntryForm.css
            ├── Entries.jsx + Entries.css
            └── Reports.jsx + Reports.css
```

---

## How Frontend and Backend Work Together

```
┌─────────────────────────────────────┐
│         Browser                     │
│   React app  (Vite : 5173)          │
│                                     │
│  1. User logs in                    │
│  2. JWT token stored in             │
│     localStorage                   │
│  3. Token sent in every             │
│     Authorization header            │
└──────────────┬──────────────────────┘
               │  HTTP  /api/*
               │  (proxied by Vite in dev)
               ▼
┌─────────────────────────────────────┐
│         Express Server : 5000       │
│                                     │
│  POST /api/auth/login               │
│  POST /api/auth/register            │
│  GET  /api/auth/me                  │
│                                     │
│  GET    /api/entries                │
│  POST   /api/entries                │
│  PUT    /api/entries/:id            │
│  DELETE /api/entries/:id            │
│  GET    /api/entries/stats/dashboard│
│  GET    /api/entries/stats/report   │
└──────────────┬──────────────────────┘
               │  Mongoose
               ▼
┌─────────────────────────────────────┐
│         MongoDB                     │
│   Collections: users, entries       │
└─────────────────────────────────────┘
```

### Development proxy

In development, Vite's dev server is configured to forward any request starting with `/api` to `http://localhost:5000`. This means the React app simply calls `/api/entries` — no hardcoded backend URL needed.

```js
// Frontend/vite.config.js
server: {
  proxy: {
    '/api': { target: 'http://localhost:5000', changeOrigin: true }
  }
}
```

### Authentication flow

```
1. User submits login form
        ↓
2. POST /api/auth/login  →  Server validates credentials
        ↓
3. Server returns { token, user }
        ↓
4. Frontend stores token in localStorage
   Sets axios default header:
   Authorization: Bearer <token>
        ↓
5. Every subsequent API call carries the token
        ↓
6. auth middleware on the server verifies the token
   and attaches req.user before passing to controller
```

---

## Tech Stack

| Layer         | Technology                           |
| ------------- | ------------------------------------ |
| Frontend      | React 18, Vite, React Router v6      |
| Backend       | Node.js 18+, Express 4               |
| Database      | MongoDB 6+ with Mongoose             |
| Auth          | JWT (jsonwebtoken) + bcryptjs        |
| HTTP Frontend | Axios                                |
| Styling       | Plain CSS with CSS custom properties |
| Dev tooling   | concurrently, nodemon                |

---

## Prerequisites

| Tool    | Minimum version                                                  | Check with         |
| ------- | ---------------------------------------------------------------- | ------------------ |
| Node.js | 18.x                                                             | `node -v`          |
| npm     | 9.x                                                              | `npm -v`           |
| MongoDB | 6.x local **or** free [Atlas](https://cloud.mongodb.com) cluster | `mongod --version` |

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/DEmosus/FreshStore-Food-Store-Management-System.git
cd FreshStore-Food-Store-Management-System.git
```

### 2. Install all dependencies

```bash
npm run install:all
```

This runs `npm install` inside root, `Backend/`, and `Frontend/` in one command.

### 3. Configure environment variables

```bash
cd Backend
cp .env.example .env
```

Edit `Backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/freshstore
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRE=7d
NODE_ENV=development
```

> **MongoDB Atlas:** swap `MONGODB_URI` for your Atlas connection string.

### 4. Run in development

```bash
# From the root directory
npm run dev
```

Both servers start together:

| Service           | URL                              |
| ----------------- | -------------------------------- |
| Frontend (Vite)   | http://localhost:5173            |
| Backend (Express) | http://localhost:5000            |
| API health check  | http://localhost:5000/api/health |

### 5. Create your first account

1. Open http://localhost:5173
2. Click **Register** on the login page
3. Fill in name, email, and password
4. You are taken straight to the dashboard

---

## Root Scripts

| Script                | What it does                                          |
| --------------------- | ----------------------------------------------------- |
| `npm run install:all` | Installs deps for root, server, and Frontend          |
| `npm run dev`         | Starts backend (nodemon) and frontend (Vite) together |
| `npm start`           | Starts the production backend server only             |

---

## Application Pages

| Route               | Page           | Protected |
| ------------------- | -------------- | --------- |
| `/login`            | Login/Register | No        |
| `/dashboard`        | Dashboard      | Yes       |
| `/entries`          | Entries list   | Yes       |
| `/add-entry`        | Add entry      | Yes       |
| `/entries/:id/edit` | Edit entry     | Yes       |
| `/reports`          | Reports        | Yes       |

---

## Production Build

### 1. Build the React app

```bash
cd Frontend
npm run build
# Output written to Frontend/dist/
```

### 2. Serve from Express

Add the following to `Backend/index.js` **after** all API routes:

```js
const path = require("path");

app.use(express.static(path.join(__dirname, "../Frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
});
```

### 3. Deploy

Upload the entire `freshstore/` directory to your host (Render, Railway, VPS, etc.) and set the environment variables in your hosting dashboard. Run `npm start` as the start command.

---

## Related Documentation

| Document           | Location             |
| ------------------ | -------------------- |
| Backend (API) docs | `Backend/README.md`  |
| Frontend (UI) docs | `Frontend/README.md` |
