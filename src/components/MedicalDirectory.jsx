// src/components/MedicalDirectory.jsx
import { useState, useEffect } from "react";
import api from "../services/api.js"; 

export default function MedicalDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await api.get("/users/doctors"); // Adjust path if needed
        const doctorsData = response.data?.data || response.data;
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) return <div style={{ padding: "20px" }}>Loading directory...</div>;

  return (
    <div style={{ padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
      {doctors.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666" }}>
          No clinical medical accounts are currently registered inside this database cluster.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {doctors.map((doctor) => (
            <div key={doctor._id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px" }}>
              <h4>{doctor.fullName}</h4>
              <p>Email: {doctor.email}</p>
              <p>Role: {doctor.role}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}