// 📑 src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    // View Configuration Switches
    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form Field Structure
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        fullName: "",
        phoneNumber: "",
        role: "patient", // Restricted to public options
        sex: "male",

        // Doctor profile specific fields matching your backend schema
        specialization: "General Medicine",
        experience: "",
        fees: "",
        qualifications: ""
    });

    // Raw binary files state management for Multer
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [certificateFile, setCertificateFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Clear any lingering form state when the login page mounts (e.g. after logout)
    useEffect(() => {
        setFormData({
            email: "",
            password: "",
            username: "",
            fullName: "",
            phoneNumber: "",
            role: "patient",
            sex: "male",
            specialization: "General Medicine",
            experience: "",
            fees: "",
            qualifications: ""
        });
        setAvatarFile(null);
        setAvatarPreview("");
        setCertificateFile(null);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
            setError("⚠️ Profile picture files must stay under a 3MB size threshold.");
            return;
        }
        setAvatarFile(file);
        if (avatarPreview) URL.revokeObjectURL(avatarPreview); // Clean memory leak paths
        setAvatarPreview(URL.createObjectURL(file));
        setError("");
    };

    const handleCertificateChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError("⚠️ Certificate document files must stay under a 5MB size threshold.");
            return;
        }
        setCertificateFile(file);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccessMessage("");

        if (isRegister && !avatarFile) {
            setError("⚠️ A profile avatar identity image file is required.");
            setLoading(false);
            return;
        }

        if (isRegister && formData.role === "doctor" && !certificateFile) {
            setError("⚠️ Medical registration certificate document is mandatory for doctors.");
            setLoading(false);
            return;
        }

        try {
            if (isRegister) {
                // 🚀 REGISTRATION PIPELINE (No admin data allocation fields)
                const dataPayload = new FormData();

                dataPayload.append("email", formData.email);
                dataPayload.append("password", formData.password);
                dataPayload.append("username", formData.username);
                dataPayload.append("fullName", formData.fullName);
                dataPayload.append("phoneNumber", formData.phoneNumber);
                dataPayload.append("role", formData.role);
                dataPayload.append("sex", formData.sex);
                dataPayload.append("avatar", avatarFile);

                if (formData.role === "doctor") {
                    dataPayload.append("certificate", certificateFile);
                    dataPayload.append("specialization", formData.specialization);
                    dataPayload.append("experience", formData.experience);
                    dataPayload.append("fees", formData.fees);

                    const parsedQualifications = formData.qualifications
                        ? formData.qualifications.split(",").map(q => q.trim())
                        : ["MBBS"];
                    dataPayload.append("qualifications", JSON.stringify(parsedQualifications));
                }

                await api.post("/users/register", dataPayload, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

                setSuccessMessage("Registration request transmitted successfully! 🎉 Awaiting administrative review...");

                setTimeout(() => {
                    setIsRegister(false);
                    setSuccessMessage("");
                    setAvatarFile(null);
                    setAvatarPreview("");
                    setCertificateFile(null);
                }, 2000);
            } else {
                // 🚀 LOGIN PIPELINE WITH AUTO-REDIRECTION CONTROL
                const result = await login(formData.email, formData.password);

                if (!result.success) {
                    // Login failed (wrong credentials, etc.) — show the error and stop.
                    setError(result.error || "Login failed. Please check your credentials.");
                    return;
                }

                // Route user dynamically based on their role from the returned user object.
                const role = result.user?.role;
                if (role === "admin") {
                    navigate("/admin/dashboard");
                } else if (role === "doctor") {
                    navigate("/doctor/dashboard");
                } else {
                    navigate("/");
                }
            }
        } catch (err) {
            console.error("Authentication submission error:", err);
            setError(err.response?.data?.message || "Onboarding transaction rejected. Verify input fields.");
        } finally {
            setLoading(false);
        }
    };

    const toggleAuthMode = () => {
        setIsRegister(!isRegister);
        setError("");
        setSuccessMessage("");
    };

    return (
        <div className="min-h-[85vh] flex justify-center items-center px-4 py-8">
            <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden transition-all duration-300">

                <div className="bg-slate-900 p-6 text-center text-white space-y-1">
                    <h2 className="text-2xl font-black tracking-tight">
                        {isRegister ? "Join MedFlow 🩺" : "Welcome Back ⚡"}
                    </h2>
                    <p className="text-slate-400 text-xs font-medium">
                        {isRegister ? "Create your clinical account profile sequence" : "Access your secure medical dashboard workspace"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4" encType="multipart/form-data">

                    {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold text-center">{error}</div>}
                    {successMessage && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold text-center">{successMessage}</div>}

                    {/* DYNAMIC MULTI-ROLE REGISTRATION FIELDS */}
                    {isRegister && (
                        <div className="grid grid-cols-2 gap-3 animate-in fade-in zoom-in-95 duration-200">

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Full Name</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Tony Stark" className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-slate-50 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none" required />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Username</label>
                                <input type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="stark_avenger" className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-slate-50 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none" required />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Account Role</label>
                                <select name="role" value={formData.role} onChange={handleInputChange} className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-slate-50 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none font-semibold text-slate-700">
                                    <option value="patient">Patient 🧑‍🦽</option>
                                    <option value="doctor">Medical Doctor 🥼</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Biological Sex</label>
                                <select name="sex" value={formData.sex} onChange={handleInputChange} className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-slate-50 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none font-semibold text-slate-700">
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Phone Number</label>
                                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="+91 XXXXX XXXXX" className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-slate-50 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none" required />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Upload Avatar Image File</label>
                                <div className="mt-1 flex items-center space-x-3 bg-slate-50 border border-slate-300 rounded-lg p-2">
                                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-sky-600 transition file:cursor-pointer" />
                                    {avatarPreview && (
                                        <img src={avatarPreview} alt="Thumbnail preview" className="h-7 w-7 rounded-full object-cover border border-slate-200" />
                                    )}
                                </div>
                            </div>

                            {/* DOCTOR CREDENTIAL METADATA WRAPPERS */}
                            {formData.role === "doctor" && (
                                <div className="col-span-2 grid grid-cols-2 gap-3 mt-2 pt-3 border-t border-dashed border-slate-200 animate-in slide-in-from-top-2 duration-200">
                                    <div className="col-span-2 bg-sky-50 border border-sky-100 rounded-lg px-3 py-1.5 text-[11px] font-medium text-sky-800">
                                        Medical Practitioner Credentials Verification Portal
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Specialization Field</label>
                                        <select name="specialization" value={formData.specialization} onChange={handleInputChange} className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-white text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none font-semibold">
                                            <option value="General Medicine">General Medicine</option>
                                            <option value="Cardiology">Cardiology</option>
                                            <option value="Neurology">Neurology</option>
                                            <option value="Pediatrics">Pediatrics</option>
                                            <option value="Dermatology">Dermatology</option>
                                            <option value="Nuclear Medicine & Trauma">Nuclear Medicine & Trauma</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Clinical Experience (Years)</label>
                                        <input type="number" name="experience" min="0" value={formData.experience} onChange={handleInputChange} placeholder="14" className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-white text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Consultation Fee (₹ INR)</label>
                                        <input type="number" name="fees" min="0" value={formData.fees} onChange={handleInputChange} placeholder="1200" className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-white text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Qualifications (Comma Separated)</label>
                                        <input type="text" name="qualifications" value={formData.qualifications} onChange={handleInputChange} placeholder="MD, PhD in Biochemistry" className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-white text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none" required />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Upload Registration Certificate (PDF/Image)</label>
                                        <div className="mt-1 bg-white border border-slate-300 rounded-lg p-2 flex items-center">
                                            <input
                                                type="file"
                                                name="certificate"
                                                accept="image/*,application/pdf"
                                                onChange={handleCertificateChange}
                                                className="text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-bold file:bg-purple-950 file:text-white hover:file:bg-purple-800 transition file:cursor-pointer"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {/* BASE AUTHENTICATION CREDENTIAL INPUT LABELS */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="stephen@medflow.com" className="w-full mt-1 p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none" required />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Secure Password</label>
                            <div className="relative mt-1">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••••••"
                                    className="w-full p-2.5 pr-10 border border-slate-300 rounded-lg bg-slate-50 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-slate-400 hover:text-sky-600 transition select-none cursor-pointer"
                                >
                                    {showPassword ? "HIDE" : "SHOW"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full mt-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider transition shadow-md flex justify-center items-center cursor-pointer disabled:bg-slate-400">
                        {loading ? "Processing Pipeline... ⏳" : isRegister ? "Submit Registration Roster " : "Authorize Session Securely "}
                    </button>

                    <div className="text-center pt-2 border-t border-slate-100">
                        <button type="button" onClick={toggleAuthMode} className="text-xs font-bold text-sky-600 hover:text-sky-700 transition focus:outline-none cursor-pointer">
                            {isRegister ? "Already registered with MedFlow? Sign In Here" : "New to this instance clinical cluster? Create An Account Here"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}