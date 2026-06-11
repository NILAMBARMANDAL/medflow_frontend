// 📑 src/pages/DoctorDashboard.jsx
import { useState, useEffect } from "react";
import api from "../services/api.js";

export default function DoctorDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    // 📄 Concluding Message Text State
    const [completingId, setCompletingId] = useState(null);
    const [clinicalNotes, setClinicalNotes] = useState("");

    const fetchDoctorLedger = async () => {
        try {
            const response = await api.get("/appointments/my-appointments");
            const appointmentsData = response.data?.data || response.data;
            setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
        } catch (err) {
            console.error("Failed to sync doctor appointments ledger:", err);
            setError("Unable to retrieve patient consultation records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctorLedger();
    }, []);

    // Handles standard status transitions (pending -> scheduled / cancelled)
    const handleUpdateStatus = async (appointmentId, targetStatus) => {
        setActionLoading(appointmentId);
        setError("");
        try {
            await api.patch("/appointments/update-status", {
                appointmentId,
                newStatus: targetStatus
            });

            setAppointments((prev) =>
                prev.map((appt) =>
                    appt._id === appointmentId ? { ...appt, status: targetStatus } : appt
                )
            );
        } catch (err) {
            console.error("Status transition rejected by server:", err);
            const msg = err.response?.data?.message || "Failed to update appointment status.";
            setError(`⚠️ Action Failed: ${msg}`);
        } finally {
            setActionLoading(null);
        }
    };

    // Handles text-only completion payload delivery
    const handleFinalizeConsultation = async (e, appointmentId) => {
        e.preventDefault();

        const trimmedNotes = clinicalNotes.trim();
        if (!trimmedNotes) {
            setError("⚠️ A concluding message is mandatory when completing an appointment.");
            return;
        }

        setActionLoading(appointmentId);
        setError("");

        try {
            // Sends a clean standard JSON object over the network layer
            await api.patch("/appointments/update-status", {
                appointmentId,
                newStatus: "completed",
                prescriptionNotes: trimmedNotes
            });

            setAppointments((prev) =>
                prev.map((appt) =>
                    appt._id === appointmentId ? { ...appt, status: "completed", prescriptionNotes: trimmedNotes } : appt
                )
            );

            // Close the expandable drawer and reset input
            setCompletingId(null);
            setClinicalNotes("");
        } catch (err) {
            console.error("Failed to update consultation status:", err);
            const msg = err.response?.data?.message || "Status mutation rejected.";
            setError(`⚠️ System Failure: ${msg}`);
        } finally {
            setActionLoading(null);
        }
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return { date: "N/A", time: "" };
        const dateObj = new Date(isoString);
        return {
            date: dateObj.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
            time: dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
        };
    };

    const getStatusStyles = (status) => {
        const normalized = status?.toLowerCase() || "pending";
        if (normalized === "completed") {
            return "bg-sky-50 border-sky-200 text-sky-700";
        }
        if (normalized === "confirmed" || normalized === "approved" || normalized === "scheduled") {
            return "bg-emerald-50 border-emerald-200 text-emerald-700";
        }
        if (normalized === "cancelled" || normalized === "rejected" || normalized === "failed") {
            return "bg-rose-50 border-rose-200 text-rose-700";
        }
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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Operations Portal</h1>
                    <p className="text-slate-400 text-xs font-medium">Review patient intake metrics and authorize consultation schedules.</p>
                </div>
                <div className="bg-sky-50 border border-sky-100 text-sky-800 text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                    Total Caseload: {appointments.length}
                </div>
            </div>

            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold animate-in fade-in">
                    {error}
                </div>
            )}

            {appointments.length === 0 ? (
                <div className="p-10 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs font-medium">
                    No active patient consultation routes are queued in your database partition.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white">
                    <div className="min-w-[850px]">
                        <div className="grid grid-cols-12 bg-slate-900 text-slate-300 text-[11px] font-bold uppercase tracking-wider px-5 py-3 border-b border-slate-800">
                            <div className="col-span-3">Patient Name</div>
                            <div className="col-span-2">Schedule Date</div>
                            <div className="col-span-4">Stated Problem / Symptoms</div>
                            <div className="col-span-1 text-center">Status</div>
                            <div className="col-span-2 text-center">Administrative Actions</div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {appointments.map((appt) => {
                                const { date, time } = formatDateTime(appt.appointmentDate);
                                const patientNode = appt.patient || appt.patientId || appt.user || appt.userId;
                                const patientName = patientNode?.fullName || patientNode?.username || "In-Network Patient";
                                const patientAvatar = patientNode?.avatar || "https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=150";
                                const currentStatus = appt.status || "pending";
                                const isExpanded = completingId === appt._id;

                                return (
                                    <div key={appt._id} className="divide-y divide-slate-100 bg-white">

                                        <div className="grid grid-cols-12 items-center px-5 py-3 hover:bg-slate-50/40 transition-colors text-xs text-slate-600">
                                            <div className="col-span-3 flex items-center space-x-3">
                                                <img src={patientAvatar} alt="Patient" className="h-8 w-8 rounded-full object-cover border border-slate-100 shadow-xs flex-shrink-0" />
                                                <span className="font-bold text-slate-800 truncate">{patientName}</span>
                                            </div>

                                            <div className="col-span-2 space-y-0.5">
                                                <p className="font-bold text-slate-700">{date}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{time}</p>
                                            </div>

                                            <div className="col-span-4 pr-4">
                                                <p className="text-slate-500 italic whitespace-normal break-words max-w-xs">
                                                    "{appt.reasonForVisit || appt.problem || "Routine health triage."}"
                                                </p>
                                            </div>

                                            <div className="col-span-1 text-center">
                                                <span className={`inline-block w-full text-center py-0.5 text-[9px] font-bold rounded-md border tracking-wider uppercase ${getStatusStyles(currentStatus)}`}>
                                                    {currentStatus}
                                                </span>
                                            </div>

                                            <div className="col-span-2 flex items-center justify-center space-x-2 px-2">
                                                {currentStatus.toLowerCase() === "pending" ? (
                                                    <>
                                                        <button
                                                            disabled={actionLoading !== null}
                                                            onClick={() => handleUpdateStatus(appt._id, "scheduled")}
                                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-1.5 rounded text-[10px] uppercase transition shadow-xs cursor-pointer disabled:opacity-40"
                                                        >
                                                            {actionLoading === appt._id ? "..." : "Approve"}
                                                        </button>
                                                        <button
                                                            disabled={actionLoading !== null}
                                                            onClick={() => handleUpdateStatus(appt._id, "cancelled")}
                                                            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-1 px-1.5 rounded text-[10px] uppercase transition shadow-xs cursor-pointer disabled:opacity-40"
                                                        >
                                                            {actionLoading === appt._id ? "..." : "Cancel"}
                                                        </button>
                                                    </>
                                                ) : currentStatus.toLowerCase() === "scheduled" ? (
                                                    <button
                                                        disabled={actionLoading !== null}
                                                        onClick={() => {
                                                            setCompletingId(isExpanded ? null : appt._id);
                                                            setError("");
                                                        }}
                                                        className={`w-full font-bold py-1 px-2 rounded text-[10px] uppercase transition shadow-xs cursor-pointer ${isExpanded ? "bg-slate-500 hover:bg-slate-600 text-white" : "bg-sky-600 hover:bg-sky-700 text-white"}`}
                                                    >
                                                        {isExpanded ? "Close Panel" : "Complete ✅"}
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 font-bold italic uppercase tracking-wider">Archived</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* INLINE EXPANDABLE TEXT-ONLY ENTRY DRAWER */}
                                        {isExpanded && (
                                            <div className="bg-slate-50 border-t border-b border-slate-200 p-4 px-6 animate-in slide-in-from-top-2 duration-200">
                                                <form onSubmit={(e) => handleFinalizeConsultation(e, appt._id)} className="flex flex-col md:flex-row items-end gap-4">

                                                    <div className="flex-1 space-y-1 w-full">
                                                        <label className="block text-[10px] font-black uppercase text-slate-600 tracking-wider">
                                                            Concluding Message / Prescription Notes *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter care directions or clinical review notes here..."
                                                            value={clinicalNotes}
                                                            onChange={(e) => setClinicalNotes(e.target.value)}
                                                            className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="w-full md:w-auto">
                                                        <button
                                                            type="submit"
                                                            disabled={actionLoading !== null}
                                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-6 rounded-lg transition tracking-wide shadow-md cursor-pointer disabled:bg-slate-400 whitespace-nowrap"
                                                        >
                                                            {actionLoading === appt._id ? "Saving Notes... ⏳" : "Finalize Session "}
                                                        </button>
                                                    </div>

                                                </form>
                                            </div>
                                        )}

                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}