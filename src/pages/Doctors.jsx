// 📑 src/pages/Doctors.jsx
import { useState, useEffect } from "react";
import api from "../services/api.js";
import axios from "axios";

export default function Doctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Standard Filter States
    const [specialization, setSpecialization] = useState("");
    const [maxFees, setMaxFees] = useState("");
    const [minExperience, setMinExperience] = useState("");

    // 🧠 AI MLOps Input States
    const [aiSymptoms, setAiSymptoms] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuccessMsg, setAiSuccessMsg] = useState("");

    // 📅 Booking Engine Dialog States
    const [selectedDoctor, setSelectedDoctor] = useState(null); 
    const [appointmentDate, setAppointmentDate] = useState("");
    const [reasonForVisit, setReasonForVisit] = useState("");
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState("");

    const fetchFilteredDirectory = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/users/doctors", {
                params: {
                    specialization: specialization || undefined,
                    maxFees: maxFees || undefined,
                    minExperience: minExperience || undefined
                }
            });
            const data = response.data?.data?.doctors || response.data?.doctors || [];
            setDoctors(data);
        } catch (err) {
            console.error("Directory query failed:", err);
            setError("Unable to retrieve matching medical provider records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFilteredDirectory();
    }, [specialization, maxFees, minExperience]);

    const handleAISymptomAnalysis = async (e) => {
        e.preventDefault();
        if (!aiSymptoms.trim()) return;

        setAiLoading(true);
        setError("");
        setAiSuccessMsg("");

        try {
            const response = await axios.post("http://127.0.0.1:5000/api/v1/predict-specialty", {
                symptoms: aiSymptoms
            });

            const predictedCategory = response.data?.recommended_specialty;
            
            if (predictedCategory) {
                setSpecialization(predictedCategory);
                setAiSuccessMsg(`🧠 MedFlow AI recommendation: Configured filter to "${predictedCategory}"`);
            }
        } catch (err) {
            console.error("AI microservice handshake failed:", err);
            setError("AI Triage engine is currently offline. Please use manual selection dropdowns.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleProcessBooking = async (e) => {
        e.preventDefault();
        
        // Target target core user identifier node safely
        const targetDoctorUserId = selectedDoctor?.doctor?._id || selectedDoctor?.doctor;

        if (!targetDoctorUserId || !appointmentDate || !reasonForVisit.trim()) {
            setError("⚠️ All structural booking constraint form metrics are required.");
            return;
        }

        setBookingLoading(true);
        setError("");
        setBookingSuccess("");

        try {
            // 🎯 FIXED: Now explicitly targets the User Collection reference object ID instead of the Profile container ID
            await api.post("/appointments/book", {
                doctorId: targetDoctorUserId, 
                appointmentDate: new Date(appointmentDate).toISOString(),
                reasonForVisit: reasonForVisit.trim()
            });

            setBookingSuccess(`🎉 Session booked with Dr. ${selectedDoctor.doctor?.fullName || "Specialist"} successfully! Status set to pending.`);
            
            setTimeout(() => {
                setSelectedDoctor(null);
                setAppointmentDate("");
                setReasonForVisit("");
                setBookingSuccess("");
            }, 2000);

        } catch (err) {
            console.error("Slot allocation transaction rejected:", err);
            setError(err.response?.data?.message || "Time slot collision or network profile failure.");
        } finally {
            setBookingLoading(false);
        }
    };

    const clearAllFilters = () => {
        setSpecialization("");
        setMaxFees("");
        setMinExperience("");
        setAiSymptoms("");
        setAiSuccessMsg("");
    };

    const RenderStarsRating = ({ avgRating, totalReviews }) => {
        const rating = avgRating || 0;
        const total = totalReviews || 0;
        return (
            <div className="flex items-center space-x-1 mt-0.5">
                <div className="flex text-amber-400 text-xs">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}>
                            ★
                        </span>
                    ))}
                </div>
                <span className="text-[11px] font-black text-slate-700 pl-0.5">{rating.toFixed(1)}</span>
                <span className="text-slate-400 text-[10px] font-medium">({total} {total === 1 ? "review" : "reviews"})</span>
            </div>
        );
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto px-4 py-4 relative">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Medical Personnel Directory</h1>
                <p className="text-slate-400 text-xs font-medium">Select an active clinical provider to book your appointment session.</p>
            </div>

            {/* AI TRIAGE SMART BAR COMPONENT */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-xl p-4 text-white shadow-md border border-slate-800">
                <form onSubmit={handleAISymptomAnalysis} className="space-y-2">
                    <div className="flex flex-col space-y-1">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-indigo-300">
                            🤖 AI Symptom Triage Classifier (MLOps Microservice)
                        </label>
                        <p className="text-slate-400 text-[11px]">Describe what you are feeling in plain text. Our Python inference engine will automatically filter to the correct specialist department.</p>
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={aiSymptoms}
                            onChange={(e) => setAiSymptoms(e.target.value)}
                            placeholder="e.g., I have sharp chest pains, elevated blood pressure, and standard shortness of breath..."
                            className="flex-1 bg-slate-800/60 border border-slate-700 p-2.5 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={aiLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition tracking-wide shadow-md disabled:bg-slate-700 cursor-pointer flex items-center shrink-0"
                        >
                            {aiLoading ? "Analyzing..." : "Analyze Symptoms 🚀"}
                        </button>
                    </div>
                    {aiSuccessMsg && (
                        <p className="text-emerald-400 text-[11px] font-bold animate-in fade-in pl-0.5">{aiSuccessMsg}</p>
                    )}
                </form>
            </div>

            {/* MANUAL GRANULAR FILTER BARS */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Department Specialty</label>
                    <select 
                        value={specialization} 
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                        <option value="">All Fields & Specialties</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Nuclear Medicine & Trauma">Nuclear Medicine & Trauma</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Max Consultation Fee</label>
                    <input 
                        type="number"
                        placeholder="Maximum budget (₹)"
                        value={maxFees}
                        onChange={(e) => setMaxFees(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Min Experience (Years)</label>
                    <input 
                        type="number"
                        placeholder="Minimum clinical years"
                        value={minExperience}
                        onChange={(e) => setMinExperience(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>

                <div className="flex items-end">
                    <button 
                        onClick={clearAllFilters}
                        className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 font-bold py-2 rounded-lg text-xs transition cursor-pointer"
                    >
                        Reset Search Parameters
                    </button>
                </div>
            </div>

            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold animate-in fade-in">{error}</div>}

            {/* DOCTOR DIRECTORY CARDS DISPLAY BLOCK */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-sky-600"></div>
                </div>
            ) : doctors.length === 0 ? (
                <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs font-medium">
                    No verified providers match your active search metrics.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctors.map((doc) => {
                        const userProfile = doc.doctor || {};
                        return (
                            <div key={doc._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex space-x-4 hover:shadow-md transition-shadow duration-200">
                                <img 
                                    src={userProfile.avatar || "https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=150"} 
                                    alt="Doctor profile" 
                                    className="h-16 w-16 rounded-full object-cover border border-slate-100 shadow-xs flex-shrink-0"
                                />
                                <div className="flex-1 space-y-2 min-w-0">
                                    <div>
                                        <h3 className="font-black text-slate-800 text-base">Dr. {userProfile.fullName}</h3>
                                        <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">{doc.specialization}</p>
                                        <RenderStarsRating avgRating={doc.averageRating} totalReviews={doc.totalReviews} />
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-medium space-y-0.5">
                                        <p>💼 Experience: <span className="text-slate-800 font-bold">{doc.experience} Years</span></p>
                                        <p>💳 Consultation Fee: <span className="text-emerald-600 font-bold">₹{doc.fees}</span></p>
                                    </div>
                                    <p className="text-slate-400 italic text-[11px] line-clamp-2">
                                        "{doc.bio || "No custom profile narrative summary provided by the physician."}"
                                    </p>
                                    <button 
                                        onClick={() => {
                                            setSelectedDoctor(doc);
                                            setError("");
                                            setBookingSuccess("");
                                        }}
                                        className="w-full mt-1 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-2 rounded-lg text-[11px] uppercase tracking-wide transition shadow-xs cursor-pointer"
                                    >
                                        Schedule Session 📅
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* FLOATING APPOINTMENT BOOKING DIALOG OVERLAY */}
            {selectedDoctor && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in duration-150">
                    <div className="bg-white rounded-xl border border-slate-200 w-full max-w-md p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
                        
                        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                            <div>
                                <h2 className="text-base font-black text-slate-900">Reserve Consultation Slot</h2>
                                <p className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider">{selectedDoctor.specialization}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedDoctor(null)}
                                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {bookingSuccess ? (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-xs font-bold text-center">
                                {bookingSuccess}
                            </div>
                        ) : (
                            <form onSubmit={handleProcessBooking} className="space-y-3.5">
                                <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <img src={selectedDoctor.doctor?.avatar} className="h-9 w-9 rounded-full object-cover border" alt="" />
                                    <div>
                                        <p className="text-xs font-black text-slate-800">Dr. {selectedDoctor.doctor?.fullName}</p>
                                        <p className="text-[10px] text-emerald-600 font-bold">Consultation Rate: ₹{selectedDoctor.fees}</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wide">Target Appointment Date & Time *</label>
                                    <input 
                                        type="datetime-local"
                                        value={appointmentDate}
                                        onChange={(e) => setAppointmentDate(e.target.value)}
                                        className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wide">Patient Intake Symptoms Narrative *</label>
                                    <textarea 
                                        placeholder="Describe your active medical problems or visit reasons explicitly..."
                                        value={reasonForVisit}
                                        onChange={(e) => setReasonForVisit(e.target.value)}
                                        rows={3}
                                        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-400"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={bookingLoading}
                                    className="w-full bg-slate-950 hover:bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-lg transition uppercase tracking-wider shadow-md disabled:bg-slate-400 cursor-pointer"
                                >
                                    {bookingLoading ? "Allocating Slot... ⏳" : "Confirm Appointment Route 🚀"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}