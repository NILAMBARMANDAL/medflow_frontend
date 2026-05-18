import { useAuth } from "../context/AuthContext";

// Dummy function simulating your actual backend API call
const mockApiCall = async () => {
  return {
    success: true,
    data: {
      fullName: "Stephen Strange",
      role: "doctor",
      avatar: "http://res.cloudinary.com/dsbxy3uq2/image/upload/v1779108315/oo1s6je7rcms50omd46o.jpg"
    }
  };
};

export default function RegisterForm() {
  const { loginDoctor } = useAuth();

  const handleRegister = async () => {
    const response = await mockApiCall(); 

    if (response.success) {
      loginDoctor(response.data); 
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", margin: "10px" }}>
      <h3>Registration</h3>
      <button onClick={handleRegister}>Register Doctor</button>
    </div>
  );
}