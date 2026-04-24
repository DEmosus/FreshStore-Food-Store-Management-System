# FreshStore — Frontend (React / Vite)

> React single-page application for the FreshStore food store management system. Provides the user interface for authentication, data entry, dashboard insights, and reporting.

---

## Overview

The frontend is a **React 18** application built with **Vite**. It communicates with the Express backend through Axios, manages authentication state with React Context, and is styled with plain CSS using CSS custom properties (variables) for theming.

---

## Folder Structure

```
Frontend/
├── index.html                    ← HTML entry point (loads DM Sans font)
├── vite.config.js                ← Vite config: dev server + /api proxy
├── package.json
└── src/
    ├── main.jsx                  ← ReactDOM.createRoot — mounts <App />
    ├── App.jsx                   ← BrowserRouter + all route definitions
    ├── index.css                 ← CSS custom properties + global base styles
    │
    ├── context/
    │   ├── AuthContext.jsx       ← AuthProvider: holds user, login, logout, register
    │   └── useAuth.js            ← useAuth() hook (separate file for fast-refresh)
    │
    ├── services/
    │   ├── api.js                ← Axios instance (baseURL=/api, 401 interceptor)
    │   └── entries.js            ← All entry-related API calls
    │
    ├── components/
    │   ├── Layout.jsx            ← Sticky topbar, nav links, user avatar, page wrapper
    │   ├── Layout.css
    │   ├── ProtectedRoute.jsx    ← Redirects to /login if user is not authenticated
    │   ├── UI.jsx                ← Shared components: Button, Input, Select, Badge,
    │   └── UI.css                   Card, Spinner, StatCard, Alert, EmptyState
    │
    └── pages/
        ├── Login.jsx + .css      ← Login and register (single page, mode toggle)
        ├── Dashboard.jsx + .css  ← Stat cards, recent entries table, inventory sidebar
        ├── EntryForm.jsx + .css  ← Add entry / edit entry (same component)
        ├── Entries.jsx + .css    ← Full entries list with search + filters + delete
        └── Reports.jsx + .css    ← Date-ranged reports, summary table, CSV export
```

---

## Setup

### 1. Install dependencies

```bash
cd Frontend
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Frontend available at: **http://localhost:5173**

> The backend must also be running on port 5000 for API calls to work. See the root `README.md` for running both together with `npm run dev`.

### 3. Build for production

```bash
npm run build
# Output: Frontend/dist/
```

---

## Available Scripts

| Script            | What it does                                      |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Start Vite dev server with hot module replacement |
| `npm run build`   | Compile and bundle for production → `dist/`       |
| `npm run preview` | Preview the production build locally              |

---

## Pages and Routes

| Route               | Component   | Description                                        |
| ------------------- | ----------- | -------------------------------------------------- |
| `/login`            | `Login`     | Email/password login. Toggle to register mode.     |
| `/dashboard`        | `Dashboard` | 4 stat cards, recent entries table, inventory bars |
| `/entries`          | `Entries`   | Full entries list with type/date/item filters      |
| `/add-entry`        | `EntryForm` | Form to record a stock delivery or sale            |
| `/entries/:id/edit` | `EntryForm` | Same form, pre-filled with existing entry data     |
| `/reports`          | `Reports`   | Filter by date range, grouped summary, CSV export  |

All routes except `/login` are protected — unauthenticated users are redirected to `/login`.

---

## Components

### Shared UI (`components/UI.jsx`)

| Component    | Props                                           | Description                                           |
| ------------ | ----------------------------------------------- | ----------------------------------------------------- |
| `Button`     | `variant`, `size`, `loading`, `disabled`        | Primary, secondary, danger, success, ghost styles     |
| `Input`      | `label`, `error`, `hint`, `...inputProps`       | Labelled input with error and hint states             |
| `Select`     | `label`, `error`, `children`, `...selectProps`  | Styled select with custom arrow                       |
| `Badge`      | `variant`                                       | Inline label: default, success, danger, warning, info |
| `Card`       | `className`, `style`, `children`                | White box with border, radius, shadow                 |
| `Spinner`    | `size`, `color`                                 | Animated SVG loading indicator                        |
| `StatCard`   | `label`, `value`, `sub`, `subVariant`, `accent` | Dashboard metric card with coloured top border        |
| `Alert`      | `variant`                                       | Inline message box: danger, success, warning, info    |
| `EmptyState` | `icon`, `title`, `description`                  | Centred empty-list placeholder                        |

**Variant options:**

- `Button` variants: `primary` `secondary` `danger` `success` `ghost`
- `Button` sizes: `sm` `md` `lg`
- `Badge` / `Alert` variants: `default` `success` `danger` `warning` `info`
- `StatCard` accents: `green` `red` `amber` `blue`

---

### Layout (`components/Layout.jsx`)

Wraps every protected page. Renders:

- Sticky topbar with the FreshStore logo
- Navigation links (Dashboard, Entries, + Add entry, Reports) — active link highlighted
- User name + initials avatar
- Logout button — calls `useAuth().logout()` and redirects to `/login`
- `<main>` content area with max-width `1200px`

---

### ProtectedRoute (`components/ProtectedRoute.jsx`)

```jsx
<ProtectedRoute>
  <Layout>
    <Dashboard />
  </Layout>
</ProtectedRoute>
```

Shows a spinner while `loading` is true. Renders children if `user` exists, otherwise redirects to `/login`.

---

## Authentication

### How it works

1. User submits the login form → `POST /api/auth/login`
2. Server returns `{ token, user }`
3. Token is saved to `localStorage` as `fs_token`
4. Axios default header is set: `Authorization: Bearer <token>`
5. On every app load, `AuthContext` reads `fs_token` from storage, calls `GET /api/auth/me` to restore the session, and sets `user` state
6. On logout, `fs_token` is removed and `user` is set to `null`

### useAuth hook

```js
import { useAuth } from "../context/useAuth";

const { user, loading, login, register, logout } = useAuth();
```

| Property   | Type           | Description                               |
| ---------- | -------------- | ----------------------------------------- |
| `user`     | object \| null | Currently authenticated user or null      |
| `loading`  | boolean        | True while session restore is in progress |
| `login`    | function       | `async (email, password) → data`          |
| `register` | function       | `async (name, email, password) → data`    |
| `logout`   | function       | Clears token and resets user state        |

---

## API Service Layer

### `services/api.js`

Creates a single Axios instance with:

- `baseURL: '/api'`
- A response interceptor that catches `401` responses, clears the stored token, and redirects to `/login`

### `services/entries.js`

```js
import { entriesService } from "../services/entries";

entriesService.getAll(params); // GET /api/entries
entriesService.getOne(id); // GET /api/entries/:id
entriesService.create(data); // POST /api/entries
entriesService.update(id, data); // PUT /api/entries/:id
entriesService.remove(id); // DELETE /api/entries/:id
entriesService.getDashboardStats(); // GET /api/entries/stats/dashboard
entriesService.getReportStats(params); // GET /api/entries/stats/report
```

---

## Styling System

### Global CSS variables (`src/index.css`)

All colours, spacing, and typography are defined as CSS custom properties on `:root`:

| Variable      | Value       | Used for                     |
| ------------- | ----------- | ---------------------------- |
| `--bg`        | `#f7f6f2`   | Page background              |
| `--surface`   | `#ffffff`   | Card and input backgrounds   |
| `--surface2`  | `#f0ede6`   | Table header, hover states   |
| `--border`    | `#e2ddd6`   | Default borders              |
| `--text`      | `#1a1916`   | Primary text                 |
| `--text2`     | `#6b6860`   | Secondary / label text       |
| `--text3`     | `#9e9b94`   | Placeholder / muted text     |
| `--green`     | `#2d7d52`   | Stock badges, success states |
| `--red`       | `#c0392b`   | Sale badges, error states    |
| `--amber`     | `#b45309`   | Warning states               |
| `--blue`      | `#1d4ed8`   | Info states                  |
| `--font`      | `'DM Sans'` | All text                     |
| `--mono`      | `'DM Mono'` | Numbers and monetary values  |
| `--radius-sm` | `6px`       | Inputs, small buttons        |
| `--radius`    | `10px`      | Buttons                      |
| `--radius-lg` | `14px`      | Cards                        |

### CSS file convention

Every component and page has its own `.css` file imported at the top:

```
Login.jsx       →  Login.css
Dashboard.jsx   →  Dashboard.css
EntryForm.jsx   →  EntryForm.css
Entries.jsx     →  Entries.css
Reports.jsx     →  Reports.css
Layout.jsx      →  Layout.css
UI.jsx          →  UI.css
```

Shared utility classes (`.fade-in`, `.spinner-center`) are defined in `index.css`.

---

## State Management

The application uses React's built-in tools only — no external state library:

| Concern               | Approach                                         |
| --------------------- | ------------------------------------------------ |
| Auth state            | React Context (`AuthContext`) + `useAuth` hook   |
| Server data           | Local `useState` per page + `useEffect` to fetch |
| Form state            | Local `useState` per form                        |
| Loading / error state | Local `useState` per page                        |
| Filter state          | Local `useState` in Entries and Reports          |

---

## Known Patterns

### Avoiding synchronous setState in effects

`Entries.jsx` uses `useTransition` to avoid calling `setLoading(true)` synchronously inside a `useEffect` body:

```js
const [isPending, startTransition] = useTransition();

const load = useCallback(() => {
  startTransition(() => setLoading(true)); // non-urgent, batched
  entriesService.getAll(params).then(...).finally(() => setLoading(false));
}, [filters]);
```

### Session restore without synchronous setState

`AuthContext.jsx` wraps the no-token case in a microtask so `setLoading` is never called synchronously inside the effect body:

```js
if (!token) {
  Promise.resolve().then(() => setLoading(false));
  return;
}
```

### Fast-refresh compliance

`useAuth` lives in `context/useAuth.js` (separate from `AuthContext.jsx`) so that each file exports only one thing — satisfying the `react-refresh/only-export-components` ESLint rule.

---

## Dependencies

| Package                      | Purpose                          |
| ---------------------------- | -------------------------------- |
| `react`                      | UI library                       |
| `react-dom`                  | DOM rendering                    |
| `react-router-dom`           | Client-side routing              |
| `axios`                      | HTTP requests to the backend API |
| `vite` (dev)                 | Build tool and dev server        |
| `@vitejs/plugin-react` (dev) | React fast-refresh support       |
