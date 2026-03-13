import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LeaderboardSelection() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="z-10 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 tracking-tight">
                    Select <span className="text-red-600">Domain</span>
                </h1>

                <div className="flex flex-col md:flex-row gap-6">
                    <button
                        onClick={() => navigate('/admin/leaderboard/web')}
                        className="group relative px-8 py-5 bg-[#111] border border-red-900/40 hover:border-red-600 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-600/20 w-64 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-linear-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="text-2xl font-bold text-gray-300 group-hover:text-white transition-colors">
                            WEB DEV
                        </span>
                    </button>

                    <button
                        onClick={() => navigate('/admin/leaderboard/aiml')}
                        className="group relative px-8 py-5 bg-[#111] border border-red-900/40 hover:border-red-600 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-600/20 w-64 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-linear-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="text-2xl font-bold text-gray-300 group-hover:text-white transition-colors">
                            AI / ML
                        </span>
                    </button>
                </div>

                <button
                    onClick={() => navigate('/admin')}
                    className="mt-16 text-gray-500 hover:text-red-400 font-semibold uppercase tracking-wider text-sm transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}
