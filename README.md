# FreshStore — Food Store Management System

A full-stack web application for managing a small food store's stock and sales, with authentication, data entry, a live dashboard, and reports.

---

## Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Frontend  | React 18 + Vite + React Router     |
| Backend   | Node.js + Express                  |
| Database  | MongoDB + Mongoose                 |
| Auth      | JWT + bcryptjs                     |
| Styling   | Plain CSS (CSS variables)          |

---

## Project Structure

```
freshstore/
├── server/                  # Express API
│   ├── config/db.js         # MongoDB connection
│   ├── models/              # Mongoose models
│   │   ├── User.js
│   │   └── Entry.js
│   ├── controllers/         # Route handlers
│   │   ├── authController.js
│   │   └── entryController.js
│   ├── routes/              # Express routers
│   │   ├── auth.js
│   │   └── entries.js
│   ├── middleware/auth.js   # JWT protect middleware
│   ├── .env.example
│   └── index.js             # Entry point
│
└── client/                  # React SPA
    └── src/
        ├── context/         # AuthContext (user state)
        ├── services/        # Axios API calls
        ├── components/      # Reusable UI + Layout
        └── pages/           # Login, Dashboard, EntryForm, Entries, Reports
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com) free tier)

---

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd freshstore

# Install root deps (concurrently)
npm install

# Install server deps
cd server && npm install && cd ..

# Install client deps
cd client && npm install && cd ..
```

---

### 2. Configure environment variables

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/freshstore
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRE=7d
NODE_ENV=development
```

> **MongoDB Atlas**: Replace `MONGODB_URI` with your Atlas connection string, e.g.:
> `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/freshstore`

---

### 3. Run the application

**Development (both server + client):**

```bash
# From root directory
npm run dev
```

This starts:
- **Backend** → `http://localhost:5000`
- **Frontend** → `http://localhost:5173`

**Production (server only, after building frontend):**

```bash
cd client && npm run build
cd ../server && npm start
```

---

### 4. Create your first account

1. Open `http://localhost:5173`
2. Click **Register** on the login page
3. Fill in your name, email, and password
4. You're in!

---

## API Endpoints

### Auth
| Method | Route              | Description         | Auth |
|--------|--------------------|---------------------|------|
| POST   | /api/auth/register | Register new user   | No   |
| POST   | /api/auth/login    | Login               | No   |
| GET    | /api/auth/me       | Get current user    | Yes  |

### Entries
| Method | Route                        | Description              | Auth |
|--------|------------------------------|--------------------------|------|
| GET    | /api/entries                 | List entries (filterable)| Yes  |
| POST   | /api/entries                 | Create entry             | Yes  |
| GET    | /api/entries/:id             | Get single entry         | Yes  |
| PUT    | /api/entries/:id             | Update entry             | Yes  |
| DELETE | /api/entries/:id             | Delete entry             | Yes  |
| GET    | /api/entries/stats/dashboard | Dashboard statistics     | Yes  |
| GET    | /api/entries/stats/report    | Report aggregations      | Yes  |

### Query Parameters for GET /api/entries
- `type` — `stock` or `sale`
- `itemName` — partial match (regex)
- `startDate` — ISO date string
- `endDate` — ISO date string
- `page` — page number (default: 1)
- `limit` — results per page (default: 50)

---

## Features

- **Authentication** — Register/login with JWT tokens, password hashing with bcrypt, protected routes
- **Dashboard** — Live stats: total stock value, sales revenue, today's activity, low stock alerts, inventory progress bars
- **Data Entry** — Add stock or sale entries with validation; dropdown of common items + custom item support; auto-calculated total
- **Entries List** — Full CRUD (create, read, update, delete) with search and filter
- **Reports** — Filter by date range and type; per-item summary; totals footer; CSV export

---

## Environment Variables

| Variable      | Description                              | Default                        |
|---------------|------------------------------------------|--------------------------------|
| PORT          | Server port                              | 5000                           |
| MONGODB_URI   | MongoDB connection string                | mongodb://localhost:27017/freshstore |
| JWT_SECRET    | Secret key for signing JWTs             | (required — change this!)      |
| JWT_EXPIRE    | JWT expiry duration                      | 7d                             |
| NODE_ENV      | Environment                              | development                    |
