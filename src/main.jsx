// 📑 src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import "./index.css";

import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Doctors from './pages/Doctors.jsx';
import MyAppointments from './pages/MyAppointments.jsx'; 
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

// 🔐 Secure Admin Gate Wrapper: Prevents URL hijacking
function AdminRoute({ children }) {
    const { user, loading } = useAuth();

    // Wait until AuthContext finishes checking browser session tokens
    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50 text-slate-500 font-medium text-xs uppercase tracking-wider">
                Verifying Credentials... ⏳
            </div>
        );
    }

    // If no active session or role is not explicitly admin, boot them back to home root path
    if (!user || user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return children;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )
      },
      {
        path: "doctors",
        element: (
          <ProtectedRoute>
            <Doctors />
          </ProtectedRoute>
        )
      },
      {
        path: "my-appointments", 
        element: (
          <ProtectedRoute>
            <MyAppointments />
          </ProtectedRoute>
        )
      },
      {
        path: "login",
        element: <Login />
      },
      {
        path: "doctor/dashboard",
        element: (
          <ProtectedRoute>
            <DoctorDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "admin/dashboard",
        element: (
          // 🎯 Guarded with the dedicated AdminRoute boundary component
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        )
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);