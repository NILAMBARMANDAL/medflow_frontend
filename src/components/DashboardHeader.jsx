import { useAuth } from "../context/AuthContext";

export default function DashboardHeader() {
  const { currentDoctor } = useAuth();

  if (!currentDoctor) {
    return <p style={{ padding: "10px" }}>No doctor logged in. Please register.</p>;
  }

  return (
    <header style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: "10px", 
      backgroundColor: "#f4f4f4", 
      padding: "10px" 
    }}>
      <img 
        src={currentDoctor.avatar} 
        alt={currentDoctor.fullName} 
        style={{ width: 40, height: 40, borderRadius: "50%" }} 
      />
      <div>
        <h4 style={{ margin: 0 }}>{currentDoctor.fullName}</h4>
        <small style={{ textTransform: "uppercase", color: "gray" }}>{currentDoctor.role}</small>
      </div>
    </header>
  );
}