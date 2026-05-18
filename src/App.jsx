import { useState } from "react"; // 📑 Import useState for view switching
import { AuthProvider } from "./context/AuthContext";
import DashboardHeader from "./components/DashboardHeader";
import RegisterForm from "./components/RegisterForm";
import Doctors from "./pages/Doctors"; // Using your updated page component
import MyAppointments from "./pages/MyAppointments"; // Import the new appointments tracker

export default function App() {
  // 🧭 Simple navigation state: 'directory' or 'appointments'
  const [currentView, setCurrentView] = useState("directory");

  return (
    <AuthProvider>
      <div style={{ fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <DashboardHeader />
        
        {/* 🛠️ Simple Quick Navigation Bar */}
        <div style={{ display: "flex", gap: "15px", marginTop: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
          <button 
            onClick={() => setCurrentView("directory")}
            style={{
              padding: "8px 16px",
              backgroundColor: currentView === "directory" ? "#0ea5e9" : "#f1f5f9",
              color: currentView === "directory" ? "#fff" : "#475569",
              border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
            }}
          >
            Find Doctors 🔍
          </button>
          <button 
            onClick={() => setCurrentView("appointments")}
            style={{
              padding: "8px 16px",
              backgroundColor: currentView === "appointments" ? "#0ea5e9" : "#f1f5f9",
              color: currentView === "appointments" ? "#fff" : "#475569",
              border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
            }}
          >
            My Appointments 📅
          </button>
        </div>
        
        <main style={{ marginTop: "20px" }}>
          {/* 🎯 Dynamic View Switcher */}
          {currentView === "directory" ? (
            <>
              <Doctors />
              <hr style={{ margin: "40px 0", borderColor: "#eee" }} />
              <RegisterForm />
            </>
          ) : (
            <MyAppointments />
          )}
        </main>
      </div>
    </AuthProvider>
  );
}