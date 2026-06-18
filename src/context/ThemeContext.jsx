// 📑 src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Initialize from localStorage, default to "light"
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });

  
    useEffect(() => {
        const root = document.documentElement; // the <html> element
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Custom hook for easy access (mirrors your useAuth pattern)
export function useTheme() {
    return useContext(ThemeContext);
}