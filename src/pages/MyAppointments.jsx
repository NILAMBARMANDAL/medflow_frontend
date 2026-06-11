// 📑 src/pages/MyAppointments.jsx
import { useState, useEffect } from "react";
import api from "../services/api.js";

export default function MyAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    //  Review Interaction States
    const [activePanelId, setActivePanelId] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const fetchUserAppointments = async () => {
        try {
            const response = await api.get("/appointments/my-appointments");
            const appointmentsData = response.data?.data || response.data;
            setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
        } catch (err) {
            console.error("Failed to parse appointment ledger:", err);
            setError("Unable to sync your appointment registry. Please reload the page.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserAppointments();
    }, []);

    const handleReviewSubmit = async (e, appointmentId) => {
        e.preventDefault();
        if (!comment.trim()) {
            setError("⚠️ Review comment text field cannot be left blank.");
            return;
        }

        setSubmitLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            await api.post("/reviews/add", {
                appointmentId,
                rating: Number(rating),
                comment: comment.trim()
            });

            setSuccessMessage("Thank you! Your feedback has been verified and calculated into the physician's profile metrics. ⭐");
            setComment("");
            setRating(5);
            
            setAppointments(prev => 
                prev.map(appt => 
                    appt._id === appointmentId ? { ...appt, isReviewedLocal: true } : appt
                )
            );
        } catch (err) {
            console.error("Review submission transaction rejected:", err);
            setError(err.response?.data?.message || "Failed to catalog feedback entry.");
        } finally {
            setSubmitLoading(false);
        }
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return { date: "To Be Scheduled", time: "" };
        const dateObj = new Date(isoString);
        
        const date = dateObj.toLocaleDateString("en-IN", { 
            weekday: "short",
            day: "numeric", 
            month: "short"
        });
        
        const time = dateObj.toLocaleTimeString("en-IN", { 
            hour: "2-digit", 
            minute: "2-digit",
            hour12: true 
        });
        
        return { date, time };
    };

const getStatusStyles = (status) => {
        const normalized = status?.toLowerCase() || "pending";
        if (normalized === "completed") {
            return "bg-sky-50 border-sky-200 text-sky-700";
        }
        if (normalized === "scheduled") {
            return "bg-emerald-50 border-emerald-200 text-emerald-700";
        }
        if (normalized === "cancelled") {
            return "bg-rose-50 border-rose-200 text-rose-700";
        }
        // pending (and any unknown) → amber
        return "bg-amber-50 border-amber-200 text-amber-700";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[40vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-sky-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-5xl mx-auto px-2 sm:px-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Your Appointment Ledger</h1>
                    <p className="text-slate-400 text-xs font-medium">Track and manage your active consultations.</p>
                </div>
                <div className="bg-sky-50 border border-sky-100 text-sky-800 text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                    Bookings: {appointments.length}
                </div>
            </div>

            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-semibold text-xs">
                    ⚠️ {error}
                </div>
            )}
            
            {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg font-bold text-xs">
                    🎉 {successMessage}
                </div>
            )}

            {appointments.length === 0 ? (
                <div className="p-10 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                    <div className="text-2xl">📅</div>
                    <h3 className="font-bold text-slate-800 text-base">No Appointments Registered</h3>
                    <p className="text-slate-400 text-xs">Head over to the medical roster directory to schedule an appointment.</p>
                </div>
            ) : (
                <div className="bg-transparent md:bg-white md:rounded-xl md:border md:border-slate-200 md:shadow-xs overflow-hidden">
                    
                    <div className="hidden md:grid grid-cols-12 bg-slate-900 text-slate-300 text-[11px] font-bold uppercase tracking-wider px-5 py-3 border-b border-slate-800">
                        <div className="col-span-3">Clinical Provider</div>
                        <div className="col-span-2">Specialization</div>
                        <div className="col-span-2">Date & Time</div>
                        <div className="col-span-3">Reason for Visit</div>
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-1 text-center">Actions</div>
                    </div>
                    
                    <div className="space-y-3 md:space-y-0 md:divide-y md:divide-slate-100">
                        {appointments.map((appt) => {
                            const { date, time } = formatDateTime(appt.appointmentDate);
                            
                            const baseDoctorNode = appt.doctor || appt.doctorId;
                            const doctorProfileNode = baseDoctorNode?.doctor || baseDoctorNode;
                            
                            const doctorName = baseDoctorNode?.fullName || doctorProfileNode?.fullName || "Medical Specialist";
                            const doctorAvatar = doctorProfileNode?.avatar || baseDoctorNode?.avatar || "https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=150";
                            const specialization = baseDoctorNode?.specialization || doctorProfileNode?.specialization || "General Medicine";
                            
                            const appointmentStatus = appt.status || "Pending";
                            const isPanelOpen = activePanelId === appt._id;

                            return (
                                <div key={appt._id} className="divide-y divide-slate-100 bg-white">
                                    
                                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs md:shadow-none md:border-none md:rounded-none md:p-0 grid grid-cols-12 gap-2 md:gap-0 items-center md:px-5 md:py-3 hover:bg-slate-50/40 transition-colors text-xs text-slate-600">
                                        
                                        <div className="col-span-12 md:col-span-3 flex items-center space-x-3 border-b border-slate-100 pb-2 md:border-none md:pb-0">
                                            <img src={doctorAvatar} alt="Physician profile" className="h-8 w-8 rounded-full object-cover border border-slate-100 shadow-xs flex-shrink-0" />
                                            <span className="font-bold text-slate-800 truncate text-sm md:text-xs">Dr. {doctorName}</span>
                                        </div>

                                        <div className="col-span-12 md:col-span-2 flex items-center md:block mt-1 md:mt-0">
                                            <span className="md:hidden font-bold text-slate-400 w-24 text-[10px] uppercase">Specialty:</span>
                                            <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-sm uppercase tracking-wide inline-block">{specialization}</span>
                                        </div>

                                        <div className="col-span-12 md:col-span-2 flex items-baseline md:block mt-0.5 md:mt-0">
                                            <span className="md:hidden font-bold text-slate-400 w-24 text-[10px] uppercase">Schedule:</span>
                                            <div className="flex space-x-2 md:space-x-0 md:block">
                                                <p className="font-bold text-slate-700">{date}</p>
                                                <p className="text-[10px] text-slate-400 font-medium md:mt-0.5">{time}</p>
                                            </div>
                                        </div>

                                        <div className="col-span-12 md:col-span-3 flex items-baseline md:block mt-0.5 md:mt-0 md:pr-4">
                                            <span className="md:hidden font-bold text-slate-400 w-24 text-[10px] uppercase">Reason:</span>
                                            <p className="text-slate-500 italic whitespace-normal break-words max-w-xs md:max-w-[220px]">
                                                "{appt.reasonForVisit || appt.problem || "Routine health evaluation."}"
                                            </p>
                                        </div>

                                        <div className="col-span-12 md:col-span-1 flex items-center justify-between md:justify-center border-t border-slate-100 pt-2 mt-2 md:border-none md:pt-0 md:mt-0">
                                            <span className="md:hidden font-bold text-slate-400 text-[10px] uppercase">Status:</span>
                                            <span className={`inline-block min-w-[75px] text-center py-0.5 text-[9px] font-bold rounded-md border tracking-wider uppercase ${getStatusStyles(appointmentStatus)}`}>
                                                {appointmentStatus}
                                            </span>
                                        </div>

                                        <div className="col-span-12 md:col-span-1 flex justify-end md:justify-center mt-2 md:mt-0">
                                            {appointmentStatus.toLowerCase() === "completed" ? (
                                                <button
                                                    onClick={() => {
                                                        setActivePanelId(isPanelOpen ? null : appt._id);
                                                        setSuccessMessage("");
                                                    }}
                                                    className={`w-full md:w-auto font-black text-[10px] uppercase tracking-wide px-2.5 py-1 rounded transition cursor-pointer shadow-xs ${isPanelOpen ? "bg-slate-500 text-white hover:bg-slate-600" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                                                >
                                                    {isPanelOpen ? "Close" : "Review 📂"}
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 font-semibold italic tracking-wide">Locked</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* 📋 INLINE EXPANDED VIEW PANEL FOR COMPLETED APPTS */}
                                    {isPanelOpen && appointmentStatus.toLowerCase() === "completed" && (
                                        <div className="bg-slate-50 border-t border-b border-slate-200 p-4 px-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                            
                                            {/* 🎯 FIXED: Clean message container layout (Scary detached file link warnings removed) */}
                                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Doctor's Concluding Consultation Message</h4>
                                                <p className="text-slate-400 text-[10px] mb-2">Summary remarks recorded directly by Dr. {doctorName}.</p>
                                                <p className="text-slate-700 font-medium text-xs bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                                                    "{appt.prescriptionNotes || appt.notes || "No closing comments provided."}"
                                                </p>
                                            </div>

                                            {/* Review Form */}
                                            {!appt.isReviewedLocal && !appt.isReviewed ? (
                                                <form onSubmit={(e) => handleReviewSubmit(e, appt._id)} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
                                                    <div className="space-y-0.5">
                                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Submit Practitioner Care Evaluation</h4>
                                                        <p className="text-slate-400 text-[11px]">Rate your experience to help update overall directory profile metrics.</p>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-t border-b border-slate-100 py-2.5">
                                                        <div className="flex items-center space-x-1.5">
                                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Score Scale:</span>
                                                            <div className="flex space-x-1">
                                                                {[1, 2, 3, 4, 5].map((num) => (
                                                                    <button
                                                                        type="button"
                                                                        key={num}
                                                                        onClick={() => setRating(num)}
                                                                        className={`text-base transition cursor-pointer select-none focus:outline-none ${num <= rating ? "text-amber-400 scale-110" : "text-slate-200 hover:text-amber-200"}`}
                                                                    >
                                                                        ★
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <span className="text-xs font-black text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-100 ml-1">{rating} / 5</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">Feedback Evaluation Narrative</label>
                                                        <textarea
                                                            value={comment}
                                                            onChange={(e) => setComment(e.target.value)}
                                                            placeholder="Describe the consultation quality, care response time, or treatment clarity..."
                                                            maxLength={500}
                                                            rows={2}
                                                            className="w-full bg-slate-50/50 border border-slate-200 p-2 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="flex justify-end">
                                                        <button
                                                            type="submit"
                                                            disabled={submitLoading}
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition tracking-wide shadow-md disabled:bg-slate-400 cursor-pointer"
                                                        >
                                                            {submitLoading ? "Publishing Assessment... ⏳" : "Submit Verification Review ⭐"}
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-center text-slate-500 text-xs font-semibold italic">
                                                    ✓ You have successfully submitted an official care review for this consultation session.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            );
                        })}
                    </div>

                </div>
            )}
        </div>
    );
}