// 📑 src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    
    // 💡 CRUCIAL: Default loading to true so the Protected Route waits 
    // for the backend to verify the cookie before making a decision!
    const [loading, setLoading] = useState(true);

    // 🔄 Auto-Check Authentication Session on App Startup
    useEffect(() => {
        const checkUserSession = async () => {
            try {
                // Hits your user.routes.js endpoint: router.route("/current-user")
                const response = await api.get("/users/current-user");
                
                const userData = response.data?.data || response.data;
                if (userData) {
                    setUser(userData);
                }
            } catch (err) {
                // If no token exists or cookie is expired, fail silently. User stays null.
                console.log("No active session token detected in browser cookies.");
            } finally {
                setLoading(false); // Release the loading screen hold
            }
        };

        checkUserSession();
    }, []);

    // 🌐 Asynchronous login execution pipeline
    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await api.post("/users/login", { email, password });
            const userData = response.data?.data?.user || response.data?.user || response.data?.data;
            setUser(userData);
            return { success: true };
        } catch (err) {
            console.error("API Handshake aborted:", err);
            const errorMessage = err.response?.data?.message || "Connection refused by authentication server.";
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // 🚪 Asynchronous logout pipeline
    const logout = async () => {
        try {
            await api.post("/users/logout");
        } catch (err) {
            console.error("Logout broadcast failed:", err);
        } finally {
            setUser(null); // Clear out local memory
        }
    };

    return (
        <AuthContext value={{ user, login, logout, loading, setUser }}>
            {children}
        </AuthContext>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}