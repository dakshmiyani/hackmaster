import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoClose, IoCalculatorOutline } from "react-icons/io5";
import { toast } from 'react-hot-toast';

const MarkingForm = ({ team, eventType, initialMarks, onClose, onSave }) => {
    const CRITERIA_BY_DOMAIN = {
        WEB: [
            { id: 'c0', label: 'Problem Understanding', description: 'Clarity of the problem definition.', maxMarks: 10 },
            { id: 'c1', label: 'Architecture & Design', description: 'Quality of system architecture.', maxMarks: 15 },
            { id: 'c2', label: 'Technical Complexity', description: 'Depth of technical implementation.', maxMarks: 15 },
            { id: 'c3', label: 'Performance', description: 'Speed and responsiveness.', maxMarks: 10 },
            { id: 'c4', label: 'Scalability', description: 'Ability to handle growth.', maxMarks: 10 },
            { id: 'c5', label: 'Security', description: 'Secure practices implementation.', maxMarks: 10 },
            { id: 'c6', label: 'Innovation', description: 'Originality of the idea.', maxMarks: 10 },
            { id: 'c7', label: 'UI/UX', description: 'Design and usability.', maxMarks: 5 },
            { id: 'c8', label: 'Real-World Impact', description: 'Practical usefulness.', maxMarks: 5 },
            { id: 'c9', label: 'Demo & Presentation', description: 'Clarity of explanation.', maxMarks: 10 }
        ],
        "AI/ML": [
            { id: 'c0', label: 'Problem Relevance', description: 'Clarity and need.', maxMarks: 10 },
            { id: 'c1', label: 'Tech Stack', description: 'Effectiveness of tools.', maxMarks: 10 },
            { id: 'c2', label: 'Data Pipeline', description: 'Quality of workflow.', maxMarks: 10 },
            { id: 'c3', label: 'Model Selection', description: 'Suitability of algorithms.', maxMarks: 15 },
            { id: 'c4', label: 'Performance', description: 'Accuracy and metrics.', maxMarks: 15 },
            { id: 'c5', label: 'UI/UX Design', description: 'Usability of system.', maxMarks: 10 },
            { id: 'c6', label: 'Integration', description: 'Seamless data flow.', maxMarks: 10 },
            { id: 'c7', label: 'Innovation', description: 'Originality of idea.', maxMarks: 5 },
            { id: 'c8', label: 'Presentation', description: 'Clarity and justification.', maxMarks: 5 },
            { id: 'c9', label: 'Security', description: 'Data protection.', maxMarks: 10 }
        ]
    };

    const evaluationCriteria = CRITERIA_BY_DOMAIN[eventType] || [];
    const totalMaxScore = evaluationCriteria.reduce((sum, c) => sum + c.maxMarks, 0);

    const [marks, setMarks] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialMarks) {
            setMarks(initialMarks);
        } else {
            const defaults = {};
            evaluationCriteria.forEach(c => defaults[c.id] = 0);
            setMarks(defaults);
        }
    }, [eventType, initialMarks]);

    const handleMarkChange = (id, value) => {
        const max = evaluationCriteria.find(c => c.id === id).maxMarks;
        let num = Number(value) || 0;
        if (num > max) num = max;
        if (num < 0) num = 0;
        setMarks(prev => ({ ...prev, [id]: num }));
    };

    const totalScore = Object.values(marks).reduce((a, b) => a + b, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axios.post("http://localhost:3000/open/api/score/submit", {
                team_id: team.teamId,
                domain: eventType,
                total_score: totalScore,
                breakdown: marks
            });
            
            if (response.data.success) {
                toast.success("Score submitted successfully!");
                onSave({ teamId: team.teamId, totalScore });
                onClose();
            } else {
                toast.error(response.data.message || "Failed to submit score");
            }
        } catch (error) {
            console.error("Score submission error:", error);
            toast.error("Error connecting to scoring service");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#111] border border-red-900/40 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden shadow-red-600/10">
                <div className="p-6 border-b border-red-900/20 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">{team.teamName}</h2>
                        <p className="text-red-500 font-semibold text-xs mt-1 uppercase tracking-widest">
                            Assessment: <span className="text-gray-400">{eventType}</span>
                        </p>
                    </div>
                    <div className="flex flex-col items-center px-4 py-2 bg-black/40 border border-red-900/40 rounded-xl">
                        <div className="flex items-center gap-2">
                            <IoCalculatorOutline className="text-red-500 text-xl" />
                            <div className="text-2xl font-black text-white">{totalScore}</div>
                        </div>
                        <span className="text-gray-500 text-[10px] font-bold">/ {totalMaxScore}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors ml-4">
                        <IoClose size={28} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {evaluationCriteria.map((c, i) => (
                            <div key={c.id} className="p-4 bg-black/40 border border-red-900/10 rounded-xl hover:border-red-900/30 transition-colors group">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-xs font-mono text-gray-600">Q{i + 1}</span>
                                            <label className="text-sm font-bold text-white uppercase tracking-wider">{c.label}</label>
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed">{c.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <input
                                            type="number"
                                            value={marks[c.id] ?? ""}
                                            onChange={(e) => handleMarkChange(c.id, e.target.value)}
                                            className="w-16 px-2 py-2 bg-black border border-red-900/40 text-red-500 font-bold text-center rounded-lg focus:outline-none focus:border-red-600 transition-colors"
                                        />
                                        <span className="text-gray-600 font-bold text-sm">/ {c.maxMarks}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 border-t border-red-900/20 bg-black/20">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Total Performance Score</span>
                            <span className="text-3xl font-black text-red-600">{totalScore} <span className="text-gray-600 text-sm font-bold">/ {totalMaxScore}</span></span>
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={onClose} className="flex-1 py-4 border border-red-900/40 text-gray-400 font-bold rounded-xl hover:bg-red-900/10 hover:text-white transition-all uppercase tracking-widest text-xs">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 uppercase tracking-widest text-xs disabled:opacity-50">
                                {isSubmitting ? "Submitting..." : "Submit Evaluation"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MarkingForm;
