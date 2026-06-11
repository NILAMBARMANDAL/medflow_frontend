# MedFlow — Frontend

The web client for **MedFlow**, a medical appointment platform. Built with React and Vite, it provides role-based interfaces for patients, doctors, and admins to manage appointments, medical records, and doctor verification.

This repository is the frontend (UI). The API server lives in a separate repository: [medflow_backend](https://github.com/NILAMBARMANDAL/medflow_backend).

## Tech Stack

- **Framework:** React 19
- **Build tool:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **HTTP client:** Axios (configured for cookie-based auth)
- **State:** React Context for global authentication state

## Features

- **Role-based UI.** Patients, doctors, and admins each see a tailored navigation and dashboard. The interface adapts based on the authenticated user's role.
- **Authentication flow.** Combined login/registration with avatar and certificate uploads (for doctors). Sessions persist across refreshes via an httpOnly cookie checked on startup, so users stay logged in without re-entering credentials.
- **Protected routes.** Route guards redirect unauthenticated users to login and restrict admin pages to admins. (Authorization is also enforced server-side — these guards are for UX.)
- **Patient experience.** Search and filter verified doctors (by specialization, fees, experience), book appointments through a modal, view an appointment ledger, and leave reviews on completed consultations.
- **Doctor dashboard.** Approve, cancel, or complete appointments; record prescription notes when finalizing a consultation.
- **Admin dashboard.** Review pending doctor applications and approve or reject their verification.

## Architecture

```
src/
├── pages/          # Route-level views (Home, Login, Doctors, dashboards, etc.)
├── components/     # Reusable components (ProtectedRoute)
├── context/        # AuthContext — global auth state via React Context
├── layouts/        # MainLayout — shared nav bar + page outlet
├── services/       # api.js — configured Axios instance
└── main.jsx        # App entry point and router configuration
```

- **Single source of truth for auth.** `AuthContext` holds the current user, exposes `login`/`logout`, and checks the session on startup. Any component reads it via a `useAuth()` hook.
- **Shared layout.** `MainLayout` renders a persistent, role-aware navigation bar with an `<Outlet />` where the active page renders.
- **Centralized API access.** A single Axios instance (`services/api.js`) carries the backend base URL and sends auth cookies with every request.

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

# (Optional) Configure the API URL — see .env.example
# By default the app connects to http://localhost:8000/api/v1
cp .env.example .env

# Start the development server
npm run dev
```

The app runs on `http://localhost:5173` by default.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the backend API. Defaults to `http://localhost:8000/api/v1` if unset. |

## Notes

This frontend pairs with the MedFlow backend API. Make sure the backend is running and its `CORS_ORIGIN` is set to this app's URL so that authentication cookies are accepted.

---

Built by Nilambar Mandal.