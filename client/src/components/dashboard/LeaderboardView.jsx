import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getLeaderboard } from '../../utils/api';

export default function LeaderboardView() {
    const { hackathonId } = useParams();
    const navigate = useNavigate();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [eventName, setEventName] = useState('');

    // hackathonId is treated as event_id
    const eventId = hackathonId || import.meta.env.VITE_EVENT_ID || 1;

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const data = await getLeaderboard(eventId);
                const rows = Array.isArray(data) ? data : [];
                setLeaderboardData(rows);
                if (rows.length > 0) setEventName(rows[0].event_name || '');
            } catch (err) {
                console.error("Leaderboard fetch error:", err);
                toast.error("Failed to load leaderboard");
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, [eventId]);

    const handleExport = () => {
        toast.success(`${eventName || 'Event'} Leaderboard exported!`);
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-red-900 selection:text-white pb-10">
            <nav className="fixed top-0 w-full z-50 bg-[#0d0d0d]/95 backdrop-blur-md border-b border-red-900/40 h-20 flex items-center justify-between px-6 lg:px-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/leaderboard-selection')}
                        className="text-gray-500 hover:text-red-500 transition-colors bg-[#111] p-2 rounded-xl border border-red-900/40 hover:border-red-600/50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                        Leaderboard <span className="text-gray-500 font-medium ml-2 text-sm uppercase">/ {eventName || `Event ${eventId}`}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-[#111] hover:bg-black border border-red-900/40 hover:border-red-600/50 text-white rounded-xl transition-all font-semibold text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Export</span>
                    </button>
                </div>
            </nav>

            <div className="pt-28 px-6 lg:px-10 max-w-7xl mx-auto relative z-10">
                <div className="bg-[#111] border border-red-900/40 rounded-xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#181818] text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-red-900/40">
                                <tr>
                                    <th className="px-6 py-4 w-20 text-center">Rank</th>
                                    <th className="px-6 py-4">Team Name</th>
                                    <th className="px-6 py-4 text-right">Total Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-red-900/20">
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, idx) => (
                                        <tr key={idx} className="animate-pulse">
                                            <td className="px-6 py-4 text-center">
                                                <div className="h-8 w-8 bg-red-900/20 rounded-full mx-auto"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-5 bg-red-900/20 rounded w-48 mb-2"></div>
                                                <div className="h-3 bg-red-900/10 rounded w-24"></div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="h-6 bg-red-900/20 rounded w-16 ml-auto"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : leaderboardData.length > 0 ? (
                                    leaderboardData.map((team) => {
                                        const rank = Number(team.rank);
                                        return (
                                            <tr key={team.team_id} className="hover:bg-[#1a1a1a] transition-colors group cursor-default">
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`
                                                        inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                                        ${rank === 1 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]' :
                                                            rank === 2 ? 'bg-gray-400/10 text-gray-300 border border-gray-400/30' :
                                                                rank === 3 ? 'bg-orange-700/10 text-orange-400 border border-orange-700/30' :
                                                                    'text-gray-500 bg-black border border-white/5'}
                                                    `}>
                                                        {rank}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                                                        {team.team_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono mt-1">ID: {team.team_id}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-bold text-2xl text-red-500">
                                                        {Number(team.total_score || 0).toFixed(0)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500 font-semibold tracking-wider">
                                            NO DATA AVAILABLE
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
