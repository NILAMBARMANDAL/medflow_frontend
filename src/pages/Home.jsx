// 📑 src/pages/Home.jsx
export default function Home() {
    return (
       <div className="min-h-[calc(100vh-72px)] -mx-6 px-6 py-12 bg-slate-50 dark:bg-slate-950 transition-colors">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Hero / welcome banner */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-8 sm:p-12 shadow-md border border-slate-200 dark:border-slate-700">
                    <span className="text-sky-400 font-bold text-xs sm:text-sm uppercase tracking-[0.2em]">
                        Your Health, Organized
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3 leading-tight">
                        Welcome to MedFlow
                    </h1>
                    <p className="text-slate-300 mt-4 font-medium text-sm sm:text-base max-w-2xl">
                        A secure platform connecting patients with verified doctors. Book appointments,
                        manage your medical records, and handle every consultation in one place.
                    </p>
                </div>

                {/* Feature highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-xs transition-colors">
                        <div className="text-3xl mb-3">🔍</div>
                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-base">Find Verified Doctors</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">Search by specialization, fees, and experience. Every doctor is admin-verified before they appear.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-xs transition-colors">
                        <div className="text-3xl mb-3">📅</div>
                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-base">Book Appointments</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">Reserve a consultation slot in seconds and track its status from pending to completed.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-xs transition-colors">
                        <div className="text-3xl mb-3">📋</div>
                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-base">Records & Reviews</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">Access prescription notes after each visit, keep your medical history, and rate your care.</p>
                    </div>
                </div>

                {/* How it works */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 sm:p-8 shadow-xs transition-colors">
                    <h2 className="font-black text-slate-800 dark:text-slate-100 text-lg mb-4">How it works</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex items-start space-x-3">
                            <span className="flex-shrink-0 h-7 w-7 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center">1</span>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">Browse verified doctors and pick the right specialist for you.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                            <span className="flex-shrink-0 h-7 w-7 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center">2</span>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">Book an appointment and wait for the doctor to confirm.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                            <span className="flex-shrink-0 h-7 w-7 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center">3</span>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">Attend your consultation, get notes, and leave a review.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}