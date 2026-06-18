import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function MainLayout() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
            {/* Header Navigation Bar */}
            <header className="flex justify-between items-center px-8 py-4 bg-slate-900 text-white shadow-md dark:shadow-slate-800/50">
                <Link to="/" className="text-xl font-black text-sky-400 tracking-tight hover:opacity-90">
                    MedFlow 🩺
                </Link>
                <div className="flex items-center space-x-6 font-medium text-sm">

                    {/* Patients or Guests view link */}
                    {user?.role !== "doctor" && user?.role !== "admin" && (
                        <Link to="/doctors" className="text-slate-300 hover:text-white transition">
                            Find Doctors
                        </Link>
                    )}

                    {/* Active Patients tracking link */}
                    {user && user.role === "patient" && (
                        <Link to="/my-appointments" className="text-slate-300 hover:text-white transition">
                            My Appointments
                        </Link>
                    )}

                    {/* Medical Specialists dashboard link */}
                    {user && user.role === "doctor" && (
                        <Link to="/doctor/dashboard" className="text-sky-400 font-bold hover:text-sky-300 transition">
                            Doctor Dashboard
                        </Link>
                    )}

                    {/* Master System Administrators command dashboard link */}
                    {user && user.role === "admin" && (
                        <Link to="/admin/dashboard" className="text-purple-400 font-black tracking-wide hover:text-purple-300 transition uppercase text-xs bg-purple-950/40 border border-purple-800 px-2.5 py-1 rounded-md">
                            System Control 🛠️
                        </Link>
                    )}

                    {/* Theme toggle — always visible, logged in or out */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-lg hover:bg-slate-700 transition cursor-pointer"
                        title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                        aria-label="Toggle theme"
                    >
                        {theme === "light" ? "🌙" : "☀️"}
                    </button>

                    {user ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-sky-300 font-semibold">
                                Hello, {user.fullName || user.username}! 👋
                            </span>
                            <button
                                onClick={logout}
                                className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-md transition shadow-sm font-bold cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-md transition shadow-sm font-bold"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </header>

            {/* Main Application Dynamic Body Window */}
            <main className="max-w-6xl mx-auto p-6">
                <Outlet />
            </main>
        </div>
    );
}