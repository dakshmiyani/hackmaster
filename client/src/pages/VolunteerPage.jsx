import React, { useState, useEffect } from 'react';
import { QrCode, UserCheck, Utensils, ShieldCheck, ArrowLeft, Loader2, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { mockVolunteerStats } from '../data/mockData';
import { Scanner } from "@yudiel/react-qr-scanner";

const VolunteerPage = () => {
    const [view, setView] = useState('dashboard'); // 'dashboard' or 'scanner'
    const [scanAction, setScanAction] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const actions = [
        { id: 'check-in', label: 'Check-In', icon: UserCheck, color: 'text-red-500', bg: 'bg-red-500/10' },
        { id: 'breakfast', label: 'Breakfast', icon: Utensils, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { id: 'lunch', label: 'Lunch', icon: Utensils, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { id: 'dinner', label: 'Dinner', icon: Utensils, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'checkout', label: 'Check-Out', icon: UserCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { id: 'assign', label: 'Assign QR', icon: QrCode, color: 'text-pink-500', bg: 'bg-pink-500/10' }
    ];

    const startScan = (action) => {
        setScanAction(action);

        if (action.id === "assign") {
            setView("selectParticipant");
        } else {
            setView("scanner");
            setIsScanning(true);
        }
    };
    const handleMockScan = () => {
        setIsLoading(true);
        setTimeout(() => {
            toast.success(`Successful ${scanAction.label}! Participant verified.`);
            setIsLoading(false);
            setView('dashboard');
        }, 1500);
    };

    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('ALL');

    const participants = [
        { id: 1, name: "Rahul Sharma", email: "rahul@gmail.com", domain: "WEB" },
        { id: 2, name: "Amit Patel", email: "amit@gmail.com", domain: "AI/ML" },
        { id: 3, name: "Priya Singh", email: "priya@gmail.com", domain: "WEB" },
        { id: 4, name: "Neha Verma", email: "neha@gmail.com", domain: "AI/ML" },
        { id: 5, name: "Suresh Pillai", email: "suresh@gmail.com", domain: "WEB" },
        { id: 6, name: "Ananya Iyer", email: "ananya@gmail.com", domain: "AI/ML" }
    ];

    const filteredParticipants = participants.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDomain = selectedDomain === 'ALL' || p.domain === selectedDomain;
        return matchesSearch && matchesDomain;
    });
    const handleScan = (qrData) => {
        if (scanAction?.id === "assign" && !selectedParticipant) {
            toast.error("Select participant first");
            return;
        }

        console.log("🔍 SCANNED DATA:", {
            qrCode: qrData,
            action: scanAction?.label,
            participant: selectedParticipant ? selectedParticipant.name : "N/A"
        });

        toast.success(`Success! Scanned: ${qrData}`);

        // Optional: Reset view after successful scan
        setTimeout(() => {
            setView("dashboard");
            setSelectedParticipant(null);
        }, 1500);
    };

    if (isLoading && view === 'dashboard') {
        return (
            <div className="min-h-screen bg-[#0d0d0d] flex flex-col p-6 space-y-6">
                <div className="h-10 w-48 bg-[#111] animate-pulse rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-[#111] animate-pulse rounded-2xl border border-red-900/10"></div>)}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-40 bg-[#111] animate-pulse rounded-2xl border border-red-900/10"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white">
            {view === 'dashboard' && (
                <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Volunteer <span className="text-red-600">Ops</span></h1>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Operational Control Center</p>
                        </div>
                        <div className="flex items-center gap-2 bg-[#111] border border-red-900/40 px-4 py-2 rounded-xl">
                            <ShieldCheck className="text-emerald-500 w-4 h-4" />
                            <span className="text-xs font-bold text-gray-300">Auth Verified</span>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#111] border border-red-900/40 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Check-Ins</p>
                                <h3 className="text-3xl font-black text-white">{mockVolunteerStats.checkIn} <span className="text-gray-600 text-sm">/ {mockVolunteerStats.totalParticipants}</span></h3>
                            </div>
                            <div className="absolute -bottom-4 -right-4 text-red-600/5 group-hover:scale-110 transition-transform">
                                <UserCheck size={120} />
                            </div>
                        </div>
                        <div className="bg-[#111] border border-red-900/40 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Lunch Served</p>
                                <h3 className="text-3xl font-black text-white">{mockVolunteerStats.meals.lunch} <span className="text-gray-600 text-sm">/ {mockVolunteerStats.checkIn}</span></h3>
                            </div>
                            <div className="absolute -bottom-4 -right-4 text-amber-600/5 group-hover:scale-110 transition-transform">
                                <Utensils size={120} />
                            </div>
                        </div>
                        <div className="bg-[#111] border border-red-900/40 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Impact</p>
                                <h3 className="text-3xl font-black text-white">{(mockVolunteerStats.checkIn / mockVolunteerStats.totalParticipants * 100).toFixed(0)}%</h3>
                            </div>
                            <div className="absolute -bottom-4 -right-4 text-emerald-600/5 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={120} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Scan Selection */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-3">
                            <QrCode className="text-red-500 w-5 h-5" />
                            Select Action
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {actions.map(action => (
                                <button
                                    key={action.id}
                                    onClick={() => startScan(action)}
                                    className="bg-[#111] border border-red-900/40 p-8 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02] hover:border-red-600 hover:shadow-2xl hover:shadow-red-600/10 group"
                                >
                                    <div className={`p-4 rounded-2xl ${action.bg} ${action.color} transition-all group-hover:scale-110`}>
                                        <action.icon size={32} />
                                    </div>
                                    <p className="font-black text-xs uppercase tracking-[0.2em] text-gray-400 group-hover:text-white">{action.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {view === "selectParticipant" && (
                <div className="fixed inset-0 bg-[#0d0d0d] z-50 flex flex-col animate-in fade-in">
                    {/* Header */}
                    <div className="h-20 border-b border-red-900/20 px-6 flex items-center justify-between">
                        <button
                            onClick={() => setView("dashboard")}
                            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest">
                                Back
                            </span>
                        </button>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em]">
                            Select Participant
                        </h2>
                        <div className="w-20"></div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="bg-[#0d0d0d] px-6 py-4 border-b border-red-900/20 sticky top-20 z-10 space-y-4">
                        <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#111] border border-red-900/40 p-3 pl-12 rounded-xl text-white focus:outline-none focus:border-red-600 transition-all text-sm font-medium"
                                />
                            </div>
                            <div className="flex bg-[#111] border border-red-900/40 p-1 rounded-xl">
                                {['ALL', 'WEB', 'AI/ML'].map(domain => (
                                    <button
                                        key={domain}
                                        onClick={() => setSelectedDomain(domain)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${selectedDomain === domain ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        {domain}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Participant List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-3 max-w-3xl mx-auto w-full custom-scrollbar">
                        {filteredParticipants.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => {
                                    setSelectedParticipant(p);
                                    setView("scanner");
                                }}
                                className="w-full bg-[#111] border border-red-900/40 rounded-xl p-5 text-left hover:border-red-600 transition-all group relative overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-lg group-hover:text-red-500 transition-colors uppercase">{p.name}</p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm text-gray-500">{p.email}</p>
                                            <span className="text-[10px] bg-red-900/10 border border-red-900/20 text-red-500 px-2 py-0.5 rounded font-black tracking-widest">{p.domain}</span>
                                        </div>
                                    </div>
                                    <ArrowLeft size={20} className="text-red-950 group-hover:text-red-600 rotate-180 transition-all" />
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                        ))}

                        {filteredParticipants.length === 0 && (
                            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-red-900/10 rounded-3xl">
                                <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">No participants found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {view === 'scanner' && (
                /* Scanner UI */
                <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in zoom-in-95">
                    {/* Scanner Header */}
                    <div className="h-20 border-b border-red-900/20 bg-[#0d0d0d] px-6 flex items-center justify-between">
                        <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                            <span className="font-bold text-xs uppercase tracking-widest">Abort Scan</span>
                        </button>
                        <div className="text-center">
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">{scanAction?.label}</h2>
                            <p className="text-[10px] text-red-500 font-bold uppercase">Awaiting Data Point...</p>
                        </div>
                        <div className="w-20"></div> {/* Spacer */}
                    </div>

                    {/* Viewfinder area */}
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                        {/* Background Visual - Moved to back */}
                        <div className="absolute inset-0 bg-[#0d0d0d] z-0">
                            <div className="h-full w-full opacity-20 bg-[radial-gradient(#DE141D_1px,transparent_1px)] bg-size-[20px_20px]"></div>
                        </div>

                        {scanAction?.id === "assign" && selectedParticipant && (
                            <div className="absolute top-28 left-1/2 -translate-x-1/2 w-full max-w-md z-40 px-4">
                                <div className="bg-[#111] border border-red-500/50 rounded-xl p-4 shadow-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Assigning To</p>
                                        <p className="font-bold text-white uppercase tracking-tight">{selectedParticipant.name}</p>
                                    </div>
                                    <button onClick={() => setView("selectParticipant")} className="text-xs text-red-500 font-bold uppercase underline">Change</button>
                                </div>
                            </div>
                        )}

                        {/* Scanner Component */}
                        <div className="w-full max-w-md rounded-xl overflow-hidden border-2 border-red-600 shadow-2xl z-30 bg-black relative">
                            <Scanner
                                onScan={(result) => {
                                    if (result?.[0]?.rawValue) {
                                        handleScan(result[0].rawValue);
                                    }
                                }}
                                onError={(error) => console.log("Scanner Error:", error)}
                                constraints={{ facingMode: "environment" }}
                                styles={{
                                    container: { width: '100%', height: '100%', minHeight: '300px' }
                                }}
                            />
                            
                            {/* Scanning Animation Overlay */}
                            <div className="absolute inset-x-0 h-0.5 bg-red-600 shadow-[0_0_15px_red] animate-[scan_2s_ease-in-out_infinite] z-40 pointer-events-none"></div>
                        </div>

                        {/* Fallback / Mock Controls */}
                        <div className="absolute bottom-10 left-0 right-0 text-center z-40 space-y-4 px-6">
                            <button
                                onClick={handleMockScan}
                                className="px-8 py-3 bg-[#111] border border-red-900/40 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-red-600 hover:border-red-600 transition-all active:scale-95 shadow-xl"
                            >
                                Force Simulation Detect
                            </button>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest opacity-50">
                                Use camera or click simulation for testing
                            </p>
                        </div>
                    </div>

                    <style>{`
                        @keyframes scan {
                            0% { top: 0%; opacity: 0; }
                            50% { opacity: 1; }
                            100% { top: 100%; opacity: 0; }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default VolunteerPage;
