// 📑 src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

   
    const [loading, setLoading] = useState(true);

   
    useEffect(() => {
        const checkUserSession = async () => {
            try {
                const response = await api.get("/users/current-user");
                const userData = response.data?.data || response.data;
                if (userData) {
                    setUser(userData);
                }
            } catch (err) {
                console.log("No active session token detected in browser cookies.");
            } finally {
                setLoading(false);
            }
        };

        checkUserSession();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await api.post("/users/login", { email, password });
            const userData = response.data?.data?.user || response.data?.user || response.data?.data;
            setUser(userData);
            return { success: true, user: userData };  
        } catch (err) {
            console.error("API Handshake aborted:", err);
            const errorMessage = err.response?.data?.message || "Connection refused by authentication server.";
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post("/users/logout");
        } catch (err) {
            console.error("Logout broadcast failed:", err);
        } finally {
            setUser(null);
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