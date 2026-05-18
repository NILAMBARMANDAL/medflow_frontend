// 📑 src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import api from "../services/api.js";

export default function AdminDashboard() {
    const [pendingProfiles, setPendingProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const fetchPendingRoster = async () => {
        try {
            // Hits our new backend route
            const response = await api.get("/users/pending-doctors");
            const data = response.data?.data || response.data;
            setPendingProfiles(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load doctor verification queue:", err);
            setError("Unable to sync the pending doctor applications registry.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingRoster();
    }, []);

    const handleVerification = async (profileId, actionType) => {
        setActionLoading(profileId);
        setError("");
        try {
            await api.patch("/users/verify-doctor", {
                profileId,
                action: actionType
            });

            // Remove from the local queue UI upon successful state mutation
            setPendingProfiles((prev) => prev.filter((p) => p._id !== profileId));
        } catch (err) {
            console.error("Verification processing failed:", err);
            setError(err.response?.data?.message || "Failed to process verification action.");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[40vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-6xl mx-auto px-2 sm:px-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Master Verification Control</h1>
                    <p className="text-slate-400 text-xs font-medium">Review credentials, credentials certificates, and authorize doctor credentials.</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                    Pending Applications: {pendingProfiles.length}
                </div>
            </div>

            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold">{error}</div>}

            {pendingProfiles.length === 0 ? (
                <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs font-medium">
                    🎉 Excellent! The medical onboarding verification queue is completely clear.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                    <div className="min-w-[950px]">
                        {/* Table Headers */}
                        <div className="grid grid-cols-12 bg-slate-900 text-slate-300 text-[11px] font-bold uppercase tracking-wider px-5 py-3 border-b border-slate-800">
                            <div className="col-span-3">Applicant Doctor</div>
                            <div className="col-span-2">Specialty & Exp</div>
                            <div className="col-span-2">Qualifications</div>
                            <div className="col-span-3">Stated Bio & Certificate Link</div>
                            <div className="col-span-2 text-center">Administrative Choice</div>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-slate-100">
                            {pendingProfiles.map((profile) => {
                                const userNode = profile.doctor; // Core User info populated from backend query
                                const doctorName = userNode?.fullName || "Awaiting Name";
                                const doctorAvatar = userNode?.avatar || "https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=150";
                                
                                return (
                                    <div key={profile._id} className="grid grid-cols-12 items-center px-5 py-4 hover:bg-slate-50/50 transition text-xs text-slate-600">
                                        
                                        {/* 1. Doctor Profile Image, Name, and Email */}
                                        <div className="col-span-3 flex items-center space-x-3">
                                            <img src={doctorAvatar} alt="Doctor profile" className="h-9 w-9 rounded-full object-cover border border-slate-100 shadow-xs flex-shrink-0" />
                                            <div className="truncate">
                                                <p className="font-bold text-slate-800 text-sm">Dr. {doctorName}</p>
                                                <p className="text-[10px] text-slate-400">@{userNode?.username}</p>
                                                <p className="text-[10px] text-slate-500 font-medium truncate">{userNode?.email}</p>
                                            </div>
                                        </div>

                                        {/* 2. Specialization & Experience */}
                                        <div className="col-span-2 space-y-1">
                                            <span className="text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded uppercase tracking-wide inline-block">
                                                {profile.specialization}
                                            </span>
                                            <p className="text-[11px] font-semibold text-slate-500 pl-1">
                                                Experience: <span className="text-slate-800 font-bold">{profile.experience} Years</span>
                                            </p>
                                        </div>

                                        {/* 3. Qualifications Array */}
                                        <div className="col-span-2 flex flex-wrap gap-1 pr-2">
                                            {Array.isArray(profile.qualifications) ? (
                                                profile.qualifications.map((qual, idx) => (
                                                    <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-medium border border-slate-200">
                                                        {qual}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded border border-slate-200 font-medium">MBBS</span>
                                            )}
                                            <p className="text-[11px] font-semibold text-slate-500 w-full mt-1 pl-0.5">
                                                Fee: <span className="text-emerald-600 font-bold">₹{profile.fees}</span>
                                            </p>
                                        </div>

                                        {/* 4. Bio and Medical Certificate Document Link */}
                                        <div className="col-span-3 pr-4 space-y-1.5">
                                            <p className="text-slate-500 italic whitespace-normal break-words line-clamp-2">
                                                "{profile.bio || "No bio statement written."}"
                                            </p>
                                            {profile.medicalCertificate && (
                                                <a 
                                                    href={profile.medicalCertificate} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-[10px] font-bold text-purple-600 hover:text-purple-800 underline transition tracking-wide bg-purple-50 px-2 py-0.5 border border-purple-200 rounded"
                                                >
                                                    📄 View Cloudinary Document 📁
                                                </a>
                                            )}
                                        </div>

                                        {/* 5. Approve & Reject Buttons */}
                                        <div className="col-span-2 flex items-center justify-center space-x-2 px-1">
                                            <button
                                                disabled={actionLoading !== null}
                                                onClick={() => handleVerification(profile._id, "approve")}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-1.5 px-2 rounded text-[10px] uppercase tracking-wide transition shadow-xs cursor-pointer disabled:opacity-40"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                disabled={actionLoading !== null}
                                                onClick={() => handleVerification(profile._id, "reject")}
                                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black py-1.5 px-2 rounded text-[10px] uppercase tracking-wide transition shadow-xs cursor-pointer disabled:opacity-40"
                                            >
                                                Reject
                                            </button>
                                        </div>

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