# MedFlow — Frontend

The web client for **MedFlow**, a medical appointment platform. Built with React 19 and Vite, it provides role-based interfaces for patients, doctors, and admins to manage appointments, medical records, and doctor verification — with a full light/dark theme.

This repository is the frontend (UI). The API server lives in a separate repository: [medflow_backend](https://github.com/NILAMBARMANDAL/medflow_backend).

---

## Deployed Links

- **Frontend:** https://medflow-frontend-azure.vercel.app
- **Backend API:** https://medflow-backend-2q2a.onrender.com

> The backend runs on Render's free tier — the first request after a period of inactivity may take ~30–50s to wake, so the very first login on a cold demo can be slow.

---

## Project Overview

MedFlow's frontend is a single-page React app that adapts to the logged-in user's role. The same shell serves three different experiences:

1. **Patients** search the verified-doctor directory, book appointments through a modal, track their appointment ledger, and review doctors after completed consultations.
2. **Doctors** manage their caseload — approving, cancelling, and completing appointments, and recording prescription notes that finalize a consultation.
3. **Admins** work a verification queue, approving or rejecting pending doctor applications.

Authentication state is global, sessions survive refreshes via an httpOnly cookie, and every page is theme-aware (light/dark). Route guards shape the UX, but all real authorization is enforced by the backend.

---

## Tech Stack

- **Framework:** React 19
- **Build tool:** Vite
- **Styling:** Tailwind CSS v4 (with class-based dark mode)
- **Routing:** React Router v7
- **HTTP client:** Axios (configured for cookie-based auth)
- **State:** React Context for global authentication and theme state
- **Deployment:** Vercel

---

## Core Features

### Authentication & Sessions

- Combined login/registration, with avatar and certificate uploads for doctors.
- Sessions persist across refreshes via an httpOnly cookie checked on startup, so users stay logged in without re-entering credentials.
- A single `AuthContext` holds the current user and exposes `login` / `logout`, read anywhere via a `useAuth()` hook.

### Role-Based UI

- Patients, doctors, and admins each see a tailored navigation bar and dashboard; the interface adapts to the authenticated user's role.
- **Protected routes** redirect unauthenticated users to login and restrict admin pages to admins. (Authorization is also enforced server-side — these guards are purely for UX.)

### Patient Experience

- Search and filter verified doctors by specialization, fees, and experience.
- Book appointments through a modal, view an appointment ledger with live status, and expand completed appointments to read the doctor's prescription notes.
- Leave a star + comment review on completed consultations (with an optimistic UI update on submit).

### Doctor Dashboard

- A caseload table of incoming appointments.
- Approve or cancel pending appointments; complete a scheduled one by recording prescription notes in an inline drawer.

### Admin Dashboard

- A verification queue of pending doctor applications showing specialization, qualifications, fees, bio, and a link to the uploaded certificate.
- One-click approve / reject.

### Dark Mode

- A site-wide light/dark theme built on Tailwind v4's class-based dark variant.
- A `ThemeContext` persists the choice to `localStorage` and toggles the `dark` class on the document root; a toggle button in the nav switches themes instantly.
- Every page — home, auth, directory, ledger, and all three dashboards — is styled for both themes.

---

## Architecture

```txt
src/
├── pages/          # Route-level views (Home, Login, Doctors, dashboards, etc.)
├── components/     # Reusable components (ProtectedRoute)
├── context/        # AuthContext + ThemeContext (global state via React Context)
├── layouts/        # MainLayout — shared nav bar + page outlet
├── services/       # api.js — configured Axios instance
└── main.jsx        # App entry point and router configuration
```

- **Single source of truth for auth.** `AuthContext` holds the current user, exposes `login`/`logout`, and checks the session on startup. Any component reads it via a `useAuth()` hook.
- **Global theme.** `ThemeContext` wraps the app, persists the theme to `localStorage`, and toggles the `dark` class on `<html>` so Tailwind's dark variants apply everywhere.
- **Shared layout.** `MainLayout` renders a persistent, role-aware navigation bar (with the theme toggle) and an `<Outlet />` where the active page renders.
- **Centralized API access.** A single Axios instance (`services/api.js`) carries the backend base URL and sends auth cookies with every request.

---

## Application Flow

```txt
App loads
    |
    v
ThemeProvider applies saved theme (light/dark) from localStorage
    |
    v
AuthProvider checks the session cookie against the backend
    |
    |-- Logged in:  user + role loaded into context
    |-- Not logged in:  guarded routes redirect to /login
    |
    v
MainLayout renders the role-aware nav; the active page renders in the Outlet
    |
    v
Pages call the backend through the shared Axios instance
(cookie sent automatically with every request)
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- The [MedFlow backend](https://github.com/NILAMBARMANDAL/medflow_backend) running (locally on port 8000 by default)

### Installation

```bash
# Clone the repository
git clone https://github.com/NILAMBARMANDAL/medflow_frontend.git
cd medflow_frontend

# Install dependencies
npm install

# Configure the API URL — see .env.example
cp .env.example .env
# set VITE_API_URL to your backend's base URL

# Start the development server
npm run dev
```

The app runs on `http://localhost:5173` by default.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:8000/api/v1` locally, or your deployed Render URL + `/api/v1` in production. |

---

## Deployment

The frontend deploys to **Vercel**; the backend (separate repo) is on **Render**.

### Frontend (Vercel)

- Import the repo into Vercel.
- **Framework Preset:** Vite (auto-detected).
- **Environment variable:** `VITE_API_URL` = your deployed backend URL + `/api/v1` (e.g. `https://medflow-backend-2q2a.onrender.com/api/v1`).
- After deploy, set the backend's `CORS_ORIGIN` (on Render) to this exact Vercel URL — no trailing slash — and redeploy the backend.

### A note on cross-site auth

The frontend (Vercel) and backend (Render) live on different domains, so the auth cookie is sent cross-site. For this to work the backend sets `secure: true` + `sameSite: "none"` in production (both require HTTPS, which both platforms provide). If login doesn't persist on the live site, the usual cause is a `CORS_ORIGIN` mismatch — it must match the Vercel URL exactly.

---

## Notes

This frontend pairs with the MedFlow backend API. For local development, make sure the backend is running and its `CORS_ORIGIN` is set to this app's URL (`http://localhost:5173`) so that authentication cookies are accepted.

---

Built by Nilambar Mandal.
