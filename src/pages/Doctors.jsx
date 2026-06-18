// 📑 src/pages/Doctors.jsx
import { useState, useEffect } from "react";
import api from "../services/api.js";

export default function Doctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Standard Filter States
    const [specialization, setSpecialization] = useState("");
    const [maxFees, setMaxFees] = useState("");
    const [minExperience, setMinExperience] = useState("");

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

    const handleProcessBooking = async (e) => {
        e.preventDefault();

        // Target core user identifier node safely
        const targetDoctorUserId = selectedDoctor?.doctor?._id || selectedDoctor?.doctor;

        if (!targetDoctorUserId || !appointmentDate || !reasonForVisit.trim()) {
            setError("⚠️ All structural booking constraint form metrics are required.");
            return;
        }

        setBookingLoading(true);
        setError("");
        setBookingSuccess("");

        try {
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
    };

    const RenderStarsRating = ({ avgRating, totalReviews }) => {
        const rating = avgRating || 0;
        const total = totalReviews || 0;
        return (
            <div className="flex items-center space-x-1 mt-0.5">
                <div className="flex text-amber-400 text-xs">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= Math.round(rating) ? "text-amber-400" : "text-slate-200 dark:text-slate-600"}>
                            ★
                        </span>
                    ))}
                </div>
                <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 pl-0.5">{rating.toFixed(1)}</span>
                <span className="text-slate-400 text-[10px] font-medium">({total} {total === 1 ? "review" : "reviews"})</span>
            </div>
        );
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto px-4 py-4 relative">
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Medical Personnel Directory</h1>
                <p className="text-slate-400 text-xs font-medium">Select an active clinical provider to book your appointment session.</p>
            </div>

            {/* MANUAL GRANULAR FILTER BARS */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-xs transition-colors">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Department Specialty</label>
                    <select
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Max Consultation Fee</label>
                    <input
                        type="number"
                        placeholder="Maximum budget (₹)"
                        value={maxFees}
                        onChange={(e) => setMaxFees(e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Min Experience (Years)</label>
                    <input
                        type="number"
                        placeholder="Minimum clinical years"
                        value={minExperience}
                        onChange={(e) => setMinExperience(e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>

                <div className="flex items-end">
                    <button
                        onClick={clearAllFilters}
                        className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 font-bold py-2 rounded-lg text-xs transition cursor-pointer"
                    >
                        Reset Search Parameters
                    </button>
                </div>
            </div>

            {error && <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-bold animate-in fade-in">{error}</div>}

            {/* DOCTOR DIRECTORY CARDS DISPLAY BLOCK */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-slate-200 dark:border-slate-700 border-t-sky-600"></div>
                </div>
            ) : doctors.length === 0 ? (
                <div className="p-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-slate-400 text-xs font-medium">
                    No verified providers match your active search metrics.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctors.map((doc) => {
                        const userProfile = doc.doctor || {};
                        return (
                            <div key={doc._id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-xs flex space-x-4 hover:shadow-md transition-shadow duration-200">
                                <img
                                    src={userProfile.avatar || "https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=150"}
                                    alt="Doctor profile"
                                    className="h-16 w-16 rounded-full object-cover border border-slate-100 dark:border-slate-700 shadow-xs flex-shrink-0"
                                />
                                <div className="flex-1 space-y-2 min-w-0">
                                    <div>
                                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-base">Dr. {userProfile.fullName}</h3>
                                        <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">{doc.specialization}</p>
                                        <RenderStarsRating avgRating={doc.averageRating} totalReviews={doc.totalReviews} />
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium space-y-0.5">
                                        <p>💼 Experience: <span className="text-slate-800 dark:text-slate-200 font-bold">{doc.experience} Years</span></p>
                                        <p>💳 Consultation Fee: <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{doc.fees}</span></p>
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
                                        className="w-full mt-1 bg-slate-900 dark:bg-slate-700 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-white font-bold py-2 rounded-lg text-[11px] uppercase tracking-wide transition shadow-xs cursor-pointer"
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
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">

                        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-700 pb-3">
                            <div>
                                <h2 className="text-base font-black text-slate-900 dark:text-slate-100">Reserve Consultation Slot</h2>
                                <p className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">{selectedDoctor.specialization}</p>
                            </div>
                            <button
                                onClick={() => setSelectedDoctor(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {bookingSuccess ? (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold text-center">
                                {bookingSuccess}
                            </div>
                        ) : (
                            <form onSubmit={handleProcessBooking} className="space-y-3.5">
                                <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-700 p-2.5 rounded-lg border border-slate-100 dark:border-slate-600">
                                    <img src={selectedDoctor.doctor?.avatar} className="h-9 w-9 rounded-full object-cover border dark:border-slate-600" alt="" />
                                    <div>
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-100">Dr. {selectedDoctor.doctor?.fullName}</p>
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Consultation Rate: ₹{selectedDoctor.fees}</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wide">Target Appointment Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={appointmentDate}
                                        onChange={(e) => setAppointmentDate(e.target.value)}
                                        className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wide">Patient Intake Symptoms Narrative *</label>
                                    <textarea
                                        placeholder="Describe your active medical problems or visit reasons explicitly..."
                                        value={reasonForVisit}
                                        onChange={(e) => setReasonForVisit(e.target.value)}
                                        rows={3}
                                        className="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-400"
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