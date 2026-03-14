import React, { useState, useEffect } from 'react';
import { IoSearchOutline, IoCheckmarkCircle } from "react-icons/io5";
import { Gavel, Trophy, LayoutGrid, List } from 'lucide-react';
import MarkingForm from '../components/dashboard/MarkingForm';
import { mockJudgeTeams } from '../data/mockData';

const JudgePage = () => {
    const [selectedEvent, setSelectedEvent] = useState('WEB');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [evaluatedTeams, setEvaluatedTeams] = useState({});

    useEffect(() => {
        setIsLoading(true);
        const fetchTeams = async () => {
            try {
                // Fetch all teams and filter by selected domain (WEB or AI/ML)
                const response = await fetch("http://localhost:3000/open/api/team/all-teams");
                const data = await response.json();
                if (data.success) {
                    // Map domain to event_name
                    const eventNameMap = {
                        'WEB': 'HACKATHON',
                        'AI/ML': 'Designathon'
                    };
                    const filtered = data.data.filter(t => t.event_name === eventNameMap[selectedEvent]);
                    const mappedTeams = filtered.map(t => ({
                        teamId: String(t.team_id),
                        teamName: t.name,
                        members: t.members || []
                    }));
                    setTeams(mappedTeams);
                }
            } catch (error) {
                console.error("Error fetching teams:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeams();
    }, [selectedEvent]);

    const filteredTeams = teams.filter(team =>
        team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.teamId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSaveMarks = ({ teamId, totalScore }) => {
        setEvaluatedTeams(prev => ({ ...prev, [teamId]: totalScore }));
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
            {/* Header */}
            <header className="h-20 border-b border-red-900/40 bg-[#0d0d0d]/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                        <Gavel className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Judge <span className="text-red-600">Portal</span></h1>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Evaluating: {selectedEvent}</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2 bg-[#111] border border-red-900/40 p-1 rounded-xl">
                    {['WEB', 'AI/ML'].map(domain => (
                        <button
                            key={domain}
                            onClick={() => setSelectedEvent(domain)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedEvent === domain ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            {domain}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8">
                {/* Search & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 relative">
                        <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
                        <input
                            type="text"
                            placeholder="Find team by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#111] border border-red-900/40 p-4 pl-14 rounded-2xl text-white focus:outline-none focus:border-red-600 transition-all shadow-xl placeholder:text-gray-600 font-medium"
                        />
                    </div>
                    <div className="bg-[#111] border border-red-900/40 rounded-2xl p-4 flex items-center justify-around shadow-xl">
                        <div className="text-center">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Teams</p>
                            <p className="text-2xl font-black text-white">{teams.length}</p>
                        </div>
                        <div className="w-px h-8 bg-red-900/20"></div>
                        <div className="text-center">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Evaluated</p>
                            <p className="text-2xl font-black text-red-600">{Object.keys(evaluatedTeams).length}</p>
                        </div>
                    </div>
                </div>

                {/* Team List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-3">
                        <Trophy className="text-red-600 w-5 h-5" />
                        Participating Teams
                    </h2>

                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-[#111] border border-red-900/40 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredTeams.map(team => {
                                const score = evaluatedTeams[team.teamId];
                                const isEvaluated = score !== undefined;

                                return (
                                    <div
                                        key={team.teamId}
                                        onClick={() => setSelectedTeam(team)}
                                        className={`group relative overflow-hidden bg-[#111] border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-red-600/10 ${isEvaluated ? 'border-emerald-900/40' : 'border-red-900/40'}`}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border transition-all ${isEvaluated ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-500' : 'bg-black/50 border-red-900/20 text-gray-600 group-hover:border-red-600 group-hover:text-red-500'}`}>
                                                    {team.teamName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-red-500 transition-colors uppercase">{team.teamName}</h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] font-mono text-gray-500 border border-gray-800 px-1.5 py-0.5 rounded">ID: {team.teamId}</span>
                                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{team.members.length} Members</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {isEvaluated ? (
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Score</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl font-black text-emerald-500">{score}</span>
                                                            <IoCheckmarkCircle className="text-emerald-500 text-xl" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest group-hover:bg-red-600 group-hover:text-white transition-all transform group-hover:translate-x-[-4px]">
                                                        Evaluate
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 transition-all group-hover:opacity-20 ${isEvaluated ? 'bg-emerald-500' : 'bg-red-600'}`}></div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!isLoading && filteredTeams.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-red-900/20 rounded-3xl">
                            <p className="text-gray-500 font-bold uppercase tracking-widest">No matching teams found</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Evaluation Modal */}
            {selectedTeam && (
                <MarkingForm
                    team={selectedTeam}
                    eventType={selectedEvent}
                    initialMarks={null}
                    onClose={() => setSelectedTeam(null)}
                    onSave={handleSaveMarks}
                />
            )}
        </div>
    );
};

export default JudgePage;
