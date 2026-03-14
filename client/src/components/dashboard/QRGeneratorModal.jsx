import React, { useState } from 'react';
import { IoClose, IoQrCodeOutline, IoDownloadOutline, IoSettingsOutline, IoReaderOutline } from "react-icons/io5";
import { toast } from 'react-hot-toast';
import axios from 'axios';

const QRGeneratorModal = ({ onClose }) => {
    const [template, setTemplate] = useState(`
<style>
  .band {
    width: 210mm;
    height: 30mm;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12mm;
    background: linear-gradient(90deg, #8b0000 0%, #c00000 50%, #8b0000 100%);
    border-top: 1mm solid #000;
    border-bottom: 1mm solid #000;
    color: #ffffff;
    box-sizing: border-box;
    overflow: hidden;
  }
  .logo-circle {
    width: 18mm;
    height: 18mm;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 900;
  }
  .center-info {
    flex: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
  }
  .band-title {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .band-subtitle {
    font-size: 7px;
    opacity: 0.9;
  }
  .qr-wrapper {
    width: 22mm;
    height: 22mm;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }
</style>

<div class="band">
  <div class="logo-circle">LOGO</div>
  <div class="center-info">
    <div class="band-title">HACKMASTER 2026</div>
    <div class="band-subtitle">OFFICIAL PARTICIPANT • ACCESS ALL AREAS</div>
  </div>
  <div class="qr-wrapper">
    {{QR_CODE}}
  </div>
</div>
    `);
    const [settings, setSettings] = useState({
        count: 30,
        qrSize: 120,
        perPage: 30,
        format: 'A4'
    });
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/open/api/qr/generate-pdf`, {
                template,
                ...settings
            }, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'qr-bands.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast.success("PDF generated and downloaded!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF. Check console for details.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#111] border border-red-900/40 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden shadow-red-600/10">
                {/* Header */}
                <div className="p-6 border-b border-red-900/20 flex justify-between items-center bg-[#151515]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center justify-center">
                            <IoQrCodeOutline className="text-red-500 text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight">QR Band Generator</h2>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Printable Layout System</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Left: Template Editor */}
                    <div className="flex-1 flex flex-col p-6 space-y-4 border-r border-red-900/20">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <IoReaderOutline />
                            <span className="text-xs font-bold uppercase tracking-widest">HTML Template</span>
                        </div>
                        <textarea
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                            className="flex-1 w-full bg-[#0d0d0d] border border-red-900/40 p-4 rounded-xl text-gray-300 font-mono text-sm focus:outline-none focus:border-red-600 transition-all resize-none"
                            placeholder="Enter HTML template with {{QR_CODE}} placeholder..."
                        />
                        <div className="bg-red-600/5 border border-red-600/10 p-3 rounded-lg">
                            <p className="text-[10px] text-red-400 leading-relaxed font-medium">
                                Use <code className="bg-red-500/10 px-1 rounded">{"{{QR_CODE}}"}</code> where you want the QR code image to appear. You can add custom CSS styles within <code className="bg-red-500/10 px-1 rounded">&lt;style&gt;</code> tags.
                            </p>
                        </div>
                    </div>

                    {/* Right: Settings & Preview */}
                    <div className="w-full md:w-80 p-6 bg-[#0d0d0d] flex flex-col gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-gray-400">
                                <IoSettingsOutline />
                                <span className="text-xs font-bold uppercase tracking-widest">Print Settings</span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 block">Total QR Count</label>
                                    <input
                                        type="number"
                                        value={settings.count}
                                        onChange={(e) => setSettings({...settings, count: parseInt(e.target.value)})}
                                        className="w-full bg-[#111] border border-red-900/40 p-2 rounded-lg text-white text-sm focus:outline-none focus:border-red-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 block">QR Size (px)</label>
                                    <input
                                        type="number"
                                        value={settings.qrSize}
                                        onChange={(e) => setSettings({...settings, qrSize: parseInt(e.target.value)})}
                                        className="w-full bg-[#111] border border-red-900/40 p-2 rounded-lg text-white text-sm focus:outline-none focus:border-red-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 block">QRs Per Page</label>
                                    <input
                                        type="number"
                                        value={settings.perPage}
                                        onChange={(e) => setSettings({...settings, perPage: parseInt(e.target.value)})}
                                        className="w-full bg-[#111] border border-red-900/40 p-2 rounded-lg text-white text-sm focus:outline-none focus:border-red-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 block">Page Format</label>
                                    <select
                                        value={settings.format}
                                        onChange={(e) => setSettings({...settings, format: e.target.value})}
                                        className="w-full bg-[#111] border border-red-900/40 p-2 rounded-lg text-white text-sm focus:outline-none focus:border-red-600"
                                    >
                                        <option value="A4">A4 (Standard)</option>
                                        <option value="Letter">Letter</option>
                                        <option value="Legal">Legal</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto space-y-3">
                            {isGenerating && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-red-500 animate-pulse">
                                        <span>Generating PDF...</span>
                                        <span>Please wait</span>
                                    </div>
                                    <div className="h-1 bg-red-900/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-600 animate-[loading_2s_infinite_linear] w-1/3 origin-left"></div>
                                    </div>
                                </div>
                            )}
                            
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <IoDownloadOutline className="text-lg" />
                                {isGenerating ? "Generating..." : "Generate & Download"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes loading {
                    0% { transform: translateX(-100%) scaleX(1); }
                    50% { transform: translateX(100%) scaleX(2); }
                    100% { transform: translateX(300%) scaleX(1); }
                }
            `}</style>
        </div>
    );
};

export default QRGeneratorModal;
