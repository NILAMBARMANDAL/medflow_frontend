// 📑 src/services/api.js
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api/v1", // 🔌 Connects directly to your Express backend port
    withCredentials: true, // 🍪 Automatically handles HTTP-Only cookies/tokens behind the scenes
    headers: {
        "Content-Type": "application/json",
    }
});

export default api;