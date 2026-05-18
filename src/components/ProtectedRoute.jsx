// 📑 src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    // 1. If the Axios session handshake is actively loading, render a pristine loader
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
            </div>
        );
    }

    // 2. If no authenticated user session profile exists, kick them straight to the login route
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Otherwise, render the secure page children seamlessly
    return children;
}