import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockTeamData } from "../data/mockData";
import { FaGithub } from "react-icons/fa";


export default function AdminPage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Hackathon");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchTeams = async () => {
      try {
        const response = await fetch("http://localhost:3000/open/api/team/all-teams");
        const data = await response.json();
        if (data.success) {
          const mappedData = data.data.map(team => ({
            teamId: String(team.team_id),
            teamName: team.name,
            category: "Hackathon", // Fallback, could map from event_id later
            members: team.members || [], // If backend doesn't send members, fallback to empty array
            projectLink: team.project_link,
            isActive: team.is_active,
            createdAt: team.created_at,
            createdBy: team.created_by
          }));
          setDashboardData(mappedData);
        } else {
          console.error("Failed to fetch teams:", data.message);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeams();
  }, [selectedCategory]);

  const stats = useMemo(() => {
    let totalTeams = 0;
    let checkedIn = 0;
    let checkedOut = 0;
    let totalMembers = 0;

    const filteredTeams = dashboardData.filter(
      (t) => t.category === selectedCategory || selectedCategory === "All"
    );

    filteredTeams.forEach((team) => {
      totalTeams++;
      const members = team.members || [];
      totalMembers += members.length;
      members.forEach((m) => {
        if (m.checkIn) checkedIn++;
        if (m.checkOut) checkedOut++;
      });
    });

    return { totalTeams, totalMembers, checkedIn, checkedOut };
  }, [dashboardData, selectedCategory]);

  const visibleTeams = useMemo(() => {
    let filteredTeams = dashboardData.filter(
      (t) => t.category === selectedCategory || selectedCategory === "All"
    );
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filteredTeams = filteredTeams.filter(
        (team) =>
          team.teamName.toLowerCase().includes(lowerTerm) ||
          team.teamId.toLowerCase().includes(lowerTerm) ||
          team.members.some((m) => m.name.toLowerCase().includes(lowerTerm))
      );
    }
    return filteredTeams;
  }, [searchTerm, selectedCategory, dashboardData]);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-red-900 selection:text-white pb-10">
      <header className="sticky top-0 z-50 border-b border-red-900/40 bg-[#0d0d0d]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1920px] items-center justify-between px-6 lg:px-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-400 font-medium">
              Hackathon Control Panel
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/leaderboard-selection")}
              className="px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] border border-red-900/40 hover:border-red-600/50 text-white rounded-xl transition-all font-semibold"
            >
              Leaderboard
            </button>
            <div className="relative">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                AD
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#111] border border-red-900/40 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <p className="text-white font-semibold">Admin User</p>
                    <p className="text-gray-400 text-xs mt-1">
                      admin@hackathon.com
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/")}
                    className="w-full text-left px-4 py-3 text-red-500 hover:bg-white/5 transition-colors text-sm font-semibold"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1920px] px-6 lg:px-10 py-8">
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-[#111] border border-red-900/40 rounded-xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-red-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl font-semibold text-white">
                  Registered Teams
                </h3>
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-[#0d0d0d] border border-red-900/40 text-gray-300 px-4 py-2 rounded-xl text-sm focus:outline-none focus:border-red-600 transition-colors"
                  >
                    <option value="All">All Categories</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="UI/UX">UI/UX</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search Teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#0d0d0d] border border-red-900/40 text-gray-300 px-4 py-2 rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors w-64"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#181818] border-b border-red-900/40 text-gray-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Team Name</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                      <th className="px-6 py-4 font-semibold">Members</th>
                      <th className="px-6 py-4 font-semibold text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-900/20">
                    {isLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="h-4 bg-red-900/20 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-red-900/10 rounded w-1/2"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 bg-red-900/20 rounded-full w-20"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              <div className="h-8 w-8 bg-red-900/20 rounded-full"></div>
                              <div className="h-8 w-8 bg-red-900/20 rounded-full"></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="h-4 bg-red-900/20 rounded w-16 ml-auto"></div>
                          </td>
                        </tr>
                      ))
                      : visibleTeams.map((team) => (
                        <tr
                          key={team.teamId}
                          onClick={() => setSelectedTeam(team)}
                          className="hover:bg-[#1a1a1a] transition-colors cursor-pointer group"
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-200 group-hover:text-red-400 transition-colors">
                              {team.teamName}
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-1">
                              {team.teamId}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-red-950/30 border border-red-900/30 text-red-500 text-xs font-semibold rounded-full">
                              {team.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex -space-x-2">
                              {team.members.map((m, i) => (
                                <div
                                  key={i}
                                  className="w-8 h-8 rounded-full bg-[#222] border-2 border-[#111] flex items-center justify-center text-xs text-gray-400 font-semibold shadow-sm"
                                  title={m.name}
                                >
                                  {m.name.charAt(0)}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {team.members && team.members.length > 0 ? (
                              team.members.some((m) => m.checkOut) ? (
                                <span className="text-gray-500 font-medium text-sm">Checked Out</span>
                              ) : team.members.every((m) => m.checkIn) ? (
                                <span className="text-emerald-500 font-medium text-sm">All Active</span>
                              ) : team.members.some((m) => m.checkIn) ? (
                                <span className="text-yellow-500 font-medium text-sm">Active</span>
                              ) : (
                                <span className="text-red-400 font-medium text-sm">Pending</span>
                              )
                            ) : team.isActive ? (
                                <span className="text-emerald-500 font-medium text-sm">Active</span>
                            ) : (
                                <span className="text-gray-500 font-medium text-sm">Inactive</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    {!isLoading && visibleTeams.length === 0 && (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No teams found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#111] border border-red-900/40 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full pointer-events-none"></div>
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-red-600 rounded-full"></span>
                Overview Stats
              </h3>
              <div className="flex flex-col gap-3">
                <div className="p-4 bg-[#0d0d0d] rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Total Teams</span>
                  <span className="text-2xl font-bold text-white font-mono">
                    {stats.totalTeams}
                  </span>
                </div>
                <div className="p-4 bg-[#0d0d0d] rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Total Members</span>
                  <span className="text-2xl font-bold text-white font-mono">
                    {stats.totalMembers}
                  </span>
                </div>
                <div className="p-4 bg-[#0d0d0d] rounded-xl border border-emerald-900/20 flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Checked In</span>
                  <span className="text-2xl font-bold text-emerald-500 font-mono">
                    {stats.checkedIn}
                  </span>
                </div>
                <div className="p-4 bg-[#0d0d0d] rounded-xl border border-red-900/20 flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Checked Out</span>
                  <span className="text-2xl font-bold text-red-500 font-mono">
                    {stats.checkedOut}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate("/admin/register")}
                className="mt-6 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(220,38,38,0.2)]"
              >
                Register Team
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedTeam && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedTeam(null)}
        >
          <div
            className="bg-[#111] border border-red-900/40 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-red-900/20 bg-[#151515] flex justify-between items-start">
              <div className="flex">

                <div className="">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {selectedTeam.teamName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-gray-400 font-mono text-xs bg-black/50 border border-white/10 px-2 py-1 rounded">
                      ID: {selectedTeam.teamId}
                    </span>
                    <span className="text-red-500 text-xs font-semibold uppercase bg-red-950/30 border border-red-900/30 px-2 py-1 rounded">
                      {selectedTeam.category}
                    </span>
                    
                    {/* Analytics Button */}
                    <div className="relative flex items-center justify-center group cursor-pointer" onClick={() => navigate("/admin/github-analytics")}>
                      <div className="text-white text-xl transition-all duration-300 group-hover:text-red-500 group-hover:drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] group-hover:scale-110">
                        <FaGithub />
                      </div>
                      <span className="absolute top-0 left-7 opacity-0 group-hover:opacity-100 transition-all duration-300 text-xs bg-black border border-red-600 text-red-500 px-2 py-1 rounded-md whitespace-nowrap z-50">
                        Git Analytics
                      </span>
                    </div>

                    {/* Project Link Button */}
                    {selectedTeam.projectLink && (
                       <a href={selectedTeam.projectLink} target="_blank" rel="noreferrer" className="text-xs bg-blue-900/30 border border-blue-800/50 text-blue-400 hover:bg-blue-800/40 px-2 py-1 rounded transition-colors">
                         View Project
                       </a>
                    )}
                  </div>
                  
                  {/* Created At / Active Status details */}
                  <div className="text-gray-400 text-xs mt-3 flex items-center gap-2">
                    <span>Registered: {new Date(selectedTeam.createdAt).toLocaleDateString()}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                    <span className={selectedTeam.isActive ? "text-emerald-500" : "text-gray-500"}>
                      {selectedTeam.isActive ? "Active Account" : "Inactive Account"}
                    </span>
                    {selectedTeam.createdBy && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                        <span>Created By User ID: {selectedTeam.createdBy}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-gray-500 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto w-full">
              <h3 className="text-lg font-semibold text-white mb-4">
                Team Members
              </h3>
              <div className="space-y-4">
                {selectedTeam.members.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 bg-[#0d0d0d] border border-white/5 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-200">
                        {member.name}
                      </h4>
                      <div className="text-sm text-gray-500 mt-1 flex gap-3">
                        <span>{member.email}</span>
                        <span>{member.phone}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end w-32">
                      <span
                        className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider ${member.checkIn
                          ? "bg-emerald-900/30 text-emerald-400"
                          : "bg-gray-900 text-gray-500"
                          }`}
                      >
                        In
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider ${member.checkOut
                          ? "bg-red-900/30 text-red-400"
                          : "bg-gray-900 text-gray-500"
                          }`}
                      >
                        Out
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}