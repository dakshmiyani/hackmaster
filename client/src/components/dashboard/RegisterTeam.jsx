import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import * as XLSX from "xlsx";

export default function RegisterTeam() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('individual');

    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', college: '', role: 'Participant', event: 'DSA', password: '', confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.role !== 'Participant' && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        setIsLoading(true);
        // Simulate API
        setTimeout(() => {
            toast.success(`${formData.role} registered successfully!`);
            setFormData({
                name: '', phone: '', email: '', college: '', role: 'Participant', event: 'DSA', password: '', confirmPassword: ''
            });
            setIsLoading(false);
        }, 1500);
    };

    const [bulkFile, setBulkFile] = useState(null);

    const handleBulkSubmit = () => {
        if (!bulkFile) {
            toast.error("No file to upload!");
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            toast.success(`Successfully registered entries from ${bulkFile.name}!`);
            setBulkFile(null);
            setIsLoading(false);
        }, 2000);
    };
    const handleDownloadSample = (type) => {
        let headers = [];
        let data = [];
        let filename = "Template.xlsx";

        if (type === 'DSA') {
            headers = ["Event_name", "member_name", "email", "phone_no", "college", "role"];
            data = [["DSA", "John Doe", "john@example.com", "9876543210", "IIT Bombay", "Participant"]];
            filename = "DSA_Template.xlsx";
        } else if (type === 'Hackathon') {
            headers = ["Event_name", "Team_Name", "Team_Leader", "Leader_email", "Leader_phone_no", "Leader_college", "Team_member_1", "Team_member_email_1", "Member1_phone_no", "Member1_college", "Team_member_2", "Team_member_email_2", "Member2_phone_no", "Member2_college", "Team_member_3", "Team_member_email_3", "Member3_phone_no", "Member3_college", "Domain"];
            data = [["Hackathon", "Innovators", "Alice Smith", "alice@example.com", "9876543210", "MIT", "Bob Jones", "bob@example.com", "9876543211", "MIT", "Charlie", "charlie@example.com", "9876543212", "MIT", "", "", "", "", ""]];
            filename = "Hackathon_Template.xlsx";
        } else if (type === 'UI/UX') {
            headers = ["Event_name", "Team_Name", "Team_Leader", "Leader_email", "Leader_phone_no", "Leader_college", "Team_member", "Team_member_email", "member_phone_no", "member_college"];
            data = [["UI/UX", "DesignPro", "Sarah Lee", "sarah@example.com", "9876543210", "NID", "Mike Ross", "mike@example.com", "9876543211"]];
            filename = "UI_UX_Template.xlsx";
        } else {
            // Default/Generic
            headers = ["name", "phone", "email", "college", "role", "event", "password", "role_id"];
            filename = "Generic_Template.xlsx";
        }

        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, filename);
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center p-6 pb-20">
            <div className="w-full max-w-md bg-[#111] border border-red-900/40 p-8 rounded-2xl shadow-xl relative z-10 flex flex-col gap-6">

                {/* Tabs */}
                <div className="flex border-b border-red-900/20">
                    <button
                        className={`flex-1 py-3 text-sm font-semibold tracking-wider uppercase transition-colors ${activeTab === 'individual' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-300'}`}
                        onClick={() => setActiveTab('individual')}
                    >
                        Individual
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-semibold tracking-wider uppercase transition-colors ${activeTab === 'bulk' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-300'}`}
                        onClick={() => setActiveTab('bulk')}
                    >
                        Bulk Upload
                    </button>
                </div>

                {/* Individual Form */}
                {activeTab === 'individual' && (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">Register <span className="text-red-600">User</span></h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Role</label>
                                <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-[#0d0d0d] border border-red-900/40 text-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-red-600 transition-colors">
                                    <option value="Participant">Participant</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Judge">Judge</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#0d0d0d] border border-red-900/40 text-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-red-600 transition-colors" required />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#0d0d0d] border border-red-900/40 text-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-red-600 transition-colors" required />
                            </div>

                            {formData.role === 'Participant' && (
                                <>
                                    <div>
                                        <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Phone Number</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#0d0d0d] border border-red-900/40 text-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-red-600 transition-colors" required />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">College</label>
                                        <input type="text" name="college" value={formData.college} onChange={handleChange} className="w-full bg-[#0d0d0d] border border-red-900/40 text-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-red-600 transition-colors" required />
                                    </div>
                                </>
                            )}

                            {formData.role !== 'Participant' && (
                                <>
                                    <div>
                                        <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-[#0d0d0d] border border-red-900/40 text-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-red-600 transition-colors" required />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Confirm Password</label>
                                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-[#0d0d0d] border border-red-900/40 text-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-red-600 transition-colors" required />
                                    </div>
                                </>
                            )}

                            <button type="submit" disabled={isLoading} className="mt-4 py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                                {isLoading ? "REGISTERING..." : "REGISTER NOW"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Bulk Upload Section */}
                {activeTab === 'bulk' && (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">Upload <span className="text-red-600">CSV/XLSX</span></h2>
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-3 gap-3 mb-2">
                                <button type="button" onClick={() => handleDownloadSample('DSA')} className="p-3 border border-red-900/40 text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-red-900/10 hover:border-red-600 transition-all flex flex-col items-center gap-2 group">
                                    <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
                                    DSA
                                </button>
                                <button type="button" onClick={() => handleDownloadSample('Hackathon')} className="p-3 border border-red-900/40 text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-red-900/10 hover:border-red-600 transition-all flex flex-col items-center gap-2 group">
                                    <span className="text-2xl group-hover:scale-110 transition-transform">💻</span>
                                    Hackathon
                                </button>
                                <button type="button" onClick={() => handleDownloadSample('UI/UX')} className="p-3 border border-red-900/40 text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-red-900/10 hover:border-red-600 transition-all flex flex-col items-center gap-2 group">
                                    <span className="text-2xl group-hover:scale-110 transition-transform">🎨</span>
                                    UI/UX
                                </button>
                            </div>

                            <div
                                className={`border-2 border-dashed border-red-900/40 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-red-600 bg-[#0d0d0d] group ${bulkFile ? 'border-red-600 bg-red-900/5' : ''}`}
                                onClick={() => document.getElementById('fileInput').click()}
                            >
                                {bulkFile ? (
                                    <div className="text-center w-full">
                                        <span className="text-3xl mb-3 block">📄</span>
                                        <p className="text-red-500 font-bold mb-3 truncate max-w-[200px] mx-auto">{bulkFile.name}</p>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); setBulkFile(null); }} className="px-4 py-1.5 bg-red-900/20 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-900/40 transition-colors">Remove File</button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-4xl mb-3 opacity-70 group-hover:scale-110 transition-transform">📂</span>
                                        <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Drag & Drop or Click</p>
                                    </>
                                )}
                                <input id="fileInput" type="file" accept=".csv, .xlsx, .xls" onChange={(e) => setBulkFile(e.target.files[0])} className="hidden" />
                            </div>

                            <button
                                type="button" onClick={handleBulkSubmit} disabled={!bulkFile || isLoading}
                                className={`w-full py-3.5 mt-4 font-bold rounded-xl transition-all shadow-lg
                                    ${bulkFile && !isLoading ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-[#222] text-gray-500 cursor-not-allowed border border-white/5'}`}
                            >
                                {isLoading ? "PROCESSING..." : "SUBMIT FILE"}
                            </button>
                        </div>
                    </div>
                )}

                <button type="button" onClick={() => navigate('/admin')} className="mt-4 text-gray-500 hover:text-white text-sm font-semibold tracking-wider transition-colors w-full uppercase">
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}
