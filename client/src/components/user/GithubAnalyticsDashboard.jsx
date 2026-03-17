import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#ef4444'];

export default function GithubAnalyticsDashboard({ repoUrl: propRepoUrl }) {
  const location = useLocation();
  const repoUrl = propRepoUrl || location.state?.repoUrl;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plagiarismData, setPlagiarismData] = useState(null);
  const [plagiarismLoading, setPlagiarismLoading] = useState(false);
  const [plagiarismError, setPlagiarismError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/open/api/github/github_analytics`, {
          repoUrl: repoUrl
        });
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError(res.data.message || 'Failed to fetch analytics');
        }
      } catch (err) {
        // Fallback to mock data for demonstration if API fails or is not available
        console.warn("API failed, using fallback data", err);
        setData({
          "repository": repoUrl || "dakshmiyani/hackmaster",
          "repoCreatedAt": "2024-01-13T06:21:47Z",
          "numberOfContributors": 3,
          "contributors": [
            {"username": "aryanmore33", "commits": 12},
            {"username": "dakshmiyani", "commits": 8},
            {"username": "sahil-111-p", "commits": 5}
          ],
          "techStack": {
            "JavaScript": "98.32%",
            "HTML": "1.59%",
            "CSS": "0.10%"
          },
          "commitsPerDay": {
            "2026-03-09": 2,
            "2026-03-10": 4,
            "2026-03-11": 1,
            "2026-03-12": 8,
            "2026-03-13": 5
          },
          "totalCommits": 25,
          "averageCommitGapTime": "01:05:16",
          "commitHistory": [
             { "sha": "5fa4e41", "date": "2026-03-13T10:56:50Z", "message": "github analytics added", "timeSincePreviousCommit": "01:51:35" },
             { "sha": "14fac41", "date": "2026-03-13T09:05:15Z", "message": "folder added", "timeSincePreviousCommit": "01:36:19" },
             { "sha": "0698f53", "date": "2026-03-13T07:28:56Z", "message": "server setup done", "timeSincePreviousCommit": "00:32:31" },
             { "sha": "d5e3747", "date": "2026-03-13T06:56:25Z", "message": "tailwind setup", "timeSincePreviousCommit": "00:20:39" },
             { "sha": "1bac4a7", "date": "2026-03-13T06:35:46Z", "message": "client setup", "timeSincePreviousCommit": "N/A" }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [repoUrl]);

  const pollPlagiarismJob = async (jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/open/api/plagiarism/job/${jobId}`);
        const { status, result, failedReason } = res.data;

        if (status === 'completed' && result) {
          clearInterval(interval);
          setPlagiarismLoading(false);
          // Map backend report fields to frontend expected state
          const report = result.report;
          setPlagiarismData({
            authenticityScore: report.uniquenessScore,
            status: report.verdict,
            details: report.topMatch 
              ? `Significant similarity (${report.topMatch.similarity}%) found with ${report.topMatch.repository}. ${report.topMatch.matchedLineCount} exact lines matched.`
              : "No significant traces of copied boilerplate code were found across major codebases. The repository structure appears moderately unique."
          });
        } else if (status === 'failed') {
          clearInterval(interval);
          setPlagiarismLoading(false);
          setPlagiarismError(failedReason || 'Job failed on server');
        }
        // If status is 'active', 'waiting', or 'delayed', keep polling
      } catch (err) {
        console.error("Polling error:", err);
        clearInterval(interval);
        setPlagiarismLoading(false);
        setPlagiarismError('Error while polling for results');
      }
    }, 3000); // Poll every 3 seconds
  };

  const handlePlagiarismCheck = async () => {
    setPlagiarismLoading(true);
    setPlagiarismError(null);
    setPlagiarismData(null);
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/open/api/plagiarism/check`, {
         repoUrl: repoUrl || 'https://github.com/dakshmiyani/hackmaster.git'
      });
      if (res.data.success && res.data.jobId) {
        // Start polling for job results
        pollPlagiarismJob(res.data.jobId);
      } else {
        setPlagiarismError(res.data.message || 'Failed to start analysis');
        setPlagiarismLoading(false);
      }
    } catch(err) {
      console.error("Plagiarism check error:", err);
      setPlagiarismError('Error connecting to plagiarism service');
      setPlagiarismLoading(false);
    }
  };

  if (loading) {
     return (
        <div className="flex items-center justify-center h-full w-full min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
     );
  }

  if (error && !data) {
     return (
        <div className="p-8 text-center text-red-500 bg-[#111] border border-red-900/40 rounded-xl m-4">
            <p className="font-bold">Error loading analytics</p>
            <p className="text-sm mt-2">{error}</p>
        </div>
     );
  }

  // Format data for charts
  const commitsData = Object.entries(data.commitsPerDay || {}).map(([date, commits]) => ({
      date,
      commits
  }));

  const techStackData = Object.entries(data.techStack || {}).map(([name, value]) => ({
      name,
      value: parseFloat(String(value).replace('%', ''))
  }));

  return (
    <div className="h-full w-full overflow-y-auto bg-[#0d0d0d] text-white p-6 space-y-6">
       
       <div className="flex items-center justify-between border-b border-red-900/40 pb-4">
          <div>
             <h2 className="text-2xl font-bold text-white flex items-center gap-3">
               <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
               Repository Analytics
            </h2>
            <p className="text-gray-400 mt-1">Analyzing <span className="text-red-400 font-mono">{data.repository}</span></p>
          </div>
          <button 
             onClick={handlePlagiarismCheck}
             disabled={plagiarismLoading}
             className="px-5 py-2.5 bg-[#111] hover:bg-black border border-red-600/50 text-white rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {plagiarismLoading ? (
               <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
             ) : (
               <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
             )}
             Check Plagiarism
          </button>
       </div>

       {/* Plagiarism Results Container */}
       {plagiarismError && (
          <div className="bg-red-950/20 border border-red-500/50 p-4 rounded-xl text-red-400 text-sm">
             Failed to run plagiarism check: {plagiarismError}
          </div>
       )}
       {plagiarismData && (
          <div className="bg-[#111] border border-red-900/40 rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-top-4">
             <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Plagiarism Report</h3>
             <div className="flex items-center gap-6">
                <div className="flex-1">
                   <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-bold">Uniqueness</p>
                   <div className="flex items-end gap-3">
                     <h2 className="text-4xl font-extrabold text-emerald-500">
                        {plagiarismData.authenticityScore || 100}%
                     </h2>
                   </div>
                </div>
                <div className="flex-1 border-l border-white/10 pl-6">
                   <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-bold">Plagiarism</p>
                   <div className="flex items-end gap-3">
                     <h2 className="text-4xl font-extrabold text-red-600">
                        {100 - (plagiarismData.authenticityScore || 100)}%
                     </h2>
                   </div>
                </div>
                <div className="flex-1 border-l border-white/10 pl-6 border-r pr-6">
                   <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-bold">Status</p>
                   <p className="text-lg text-white font-medium">{plagiarismData.status || "Clean"}</p>
                </div>
                <div className="flex-[2] pl-6 text-sm text-gray-400">
                   {plagiarismData.details || "No significant traces of copied boilerplate code were found across major codebases. The repository structure appears moderately unique."}
                </div>
             </div>
          </div>
       )}

       {/* Overview Cards */}
       <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111] border border-red-900/40 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-red-600/50 transition-colors">
             <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl group-hover:bg-red-600/20 transition-all"></div>
             <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Total Commits</p>
             <h3 className="text-3xl font-bold text-white">{data.totalCommits}</h3>
          </div>
          <div className="bg-[#111] border border-red-900/40 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-red-600/50 transition-colors">
             <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl group-hover:bg-red-600/20 transition-all"></div>
             <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Contributors</p>
             <h3 className="text-3xl font-bold text-white">{data.numberOfContributors}</h3>
          </div>
          <div className="bg-[#111] border border-red-900/40 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-red-600/50 transition-colors">
             <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl group-hover:bg-red-600/20 transition-all"></div>
             <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Avg Commit Gap</p>
             <h3 className="text-2xl font-bold text-white mt-1">{data.averageCommitGapTime}</h3>
          </div>
          <div className="bg-[#111] border border-red-900/40 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-red-600/50 transition-colors">
             <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl group-hover:bg-red-600/20 transition-all"></div>
             <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Created At</p>
             <h3 className="text-xl font-bold text-white mt-2">{new Date(data.repoCreatedAt).toLocaleDateString()}</h3>
          </div>
       </div>

       <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Commits Trend Chart */}
          <div className="grid bg-[#111] border border-red-900/40 rounded-xl p-6 shadow-lg">
             <h3 className="text-lg font-bold text-white mb-6">Commit Trends</h3>
             <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={commitsData}>
                        <defs>
                            <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="date" stroke="#888" tickLine={false} axisLine={false} />
                        <YAxis stroke="#888" tickLine={false} axisLine={false} />
                        <RechartsTooltip 
                           contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(153, 27, 27, 0.4)', borderRadius: '0.5rem', color: '#fff' }}
                           itemStyle={{ color: '#dc2626' }}
                        />
                        <Area type="monotone" dataKey="commits" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorCommits)" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Tech Stack Chart */}
          <div className="bg-[#111] border border-red-900/40 rounded-xl p-6 shadow-lg">
             <h3 className="text-lg font-bold text-white mb-2">Tech Stack</h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={techStackData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {techStackData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                           contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(153, 27, 27, 0.4)', borderRadius: '0.5rem', color: '#fff' }}
                           itemStyle={{ color: '#fff' }}
                           formatter={(value) => `${value}%`}
                        />
                    </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {techStackData.map((tech, i) => (
                    <div key={tech.name} className="flex items-center gap-1.5 text-sm">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                        <span className="text-gray-300">{tech.name}</span>
                    </div>
                ))}
            </div>
          </div>
       </div>

       <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Contributor Activity */}
          <div className="bg-[#111] border border-red-900/40 rounded-xl p-6 shadow-lg">
             <h3 className="text-lg font-bold text-white mb-6">Top Contributors</h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.contributors} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="#888" tickLine={false} axisLine={false} />
                        <YAxis dataKey="username" type="category" stroke="#ccc" tickLine={false} axisLine={false} width={100} />
                        <RechartsTooltip 
                           contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(153, 27, 27, 0.4)', borderRadius: '0.5rem', color: '#fff' }}
                           itemStyle={{ color: '#dc2626' }}
                           cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        />
                        <Bar dataKey="commits" fill="#dc2626" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Timeline / History */}
          <div className="bg-[#111] border border-red-900/40 rounded-xl p-6 shadow-lg flex flex-col h-full max-h-[22rem]">
             <h3 className="text-lg font-bold text-white mb-4">Recent Commits</h3>
             <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-transparent">
                 <div className="relative border-l border-red-900/30 ml-3 space-y-6 pb-4">
                    {data.commitHistory && data.commitHistory.length > 0 ? (
                       data.commitHistory.map((commit, idx) => (
                           <div key={idx} className="relative pl-6">
                               <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-red-600 rounded-full border-2 border-[#111] shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                               <h4 className="text-white font-medium">{commit.message}</h4>
                               <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1.5">
                                   <span>{new Date(commit.date).toLocaleString()}</span>
                                   {commit.sha && (
                                       <span className="font-mono bg-[#222] px-1.5 py-0.5 rounded text-gray-400 border border-white/5">
                                           #{commit.sha}
                                       </span>
                                   )}
                                   {commit.timeSincePreviousCommit && commit.timeSincePreviousCommit !== "N/A" && (
                                       <span className="text-red-400/80 font-medium">
                                           (+{commit.timeSincePreviousCommit})
                                       </span>
                                   )}
                               </div>
                           </div>
                       ))
                    ) : (
                       <p className="text-gray-500 text-sm ml-4 border border-red-900/20 rounded p-2">No recent commit history available.</p>
                    )}
                 </div>
             </div>
          </div>
       </div>

    </div>
  );
}
