import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import Navbar from '../components/user/Navbar';
import HackathonCard from '../components/user/HackathonCard';
import ChatView from '../components/user/ChatView';
import socket from '../utils/socket';

/* ─── Mock Data ─── */
const ongoingHackathons = [
  {
    id: 'ongoing-1',
    name: 'CodeStorm 2026',
    tagline: 'Build the future, one commit at a time.',
    domain: 'AI / ML',
    participants: '320',
    timeRemaining: '4h 35m left',
    prize: '₹2,00,000',
    team: 'NullPointers',
    startDate: 'Mar 13, 2026',
  },
  {
    id: 'ongoing-2',
    name: 'QuantumHack Spring',
    tagline: 'Next-gen solutions for real-world problems.',
    domain: 'FinTech',
    participants: '210',
    timeRemaining: '9h 10m left',
    prize: '₹1,50,000',
    team: 'NullPointers',
    startDate: 'Mar 13, 2026',
  },
];

const pastHackathons = [
  {
    id: 'past-1',
    name: 'HackBlitz 2025',
    tagline: 'Blazing fast innovation.',
    domain: 'Web3',
    participants: '415',
    duration: '48 hrs',
    rank: '🥇 1st Place',
    team: 'NullPointers',
    endDate: 'Dec 20, 2025',
  },
  {
    id: 'past-2',
    name: 'DataDriven Hackathon',
    tagline: 'Smart data, smarter solutions.',
    domain: 'Data Science',
    participants: '280',
    duration: '24 hrs',
    rank: '🥈 2nd Place',
    team: 'NullPointers',
    endDate: 'Oct 05, 2025',
  },
  {
    id: 'past-3',
    name: 'CyberShield 2025',
    tagline: 'Defending the digital frontier.',
    domain: 'Cybersecurity',
    participants: '195',
    duration: '36 hrs',
    rank: '🏅 Top 10',
    team: 'NullPointers',
    endDate: 'Jul 18, 2025',
  },
  {
    id: 'past-4',
    name: 'InnovateSphere',
    tagline: 'Where ideas become reality.',
    domain: 'IoT',
    participants: '340',
    duration: '48 hrs',
    rank: '🥉 3rd Place',
    team: 'NullPointers',
    endDate: 'Apr 01, 2025',
  },
];

/* ─── Stat Card ─── */
const StatCard = ({ icon, value, label }) => (
  <div className="bg-[#111] border border-[#222] rounded-2xl px-5 py-4 flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-red-900/30 border border-red-900/40 flex items-center justify-center text-xl shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-white font-bold text-2xl leading-tight">{value}</p>
      <p className="text-gray-500 text-xs mt-0.5">{label}</p>
    </div>
  </div>
);

/* ─── UserPage ─── */
const UserPage = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  
  const [activeChat, setActiveChat] = useState(null);
  const [mentorNotification, setMentorNotification] = useState(null);
  const [teamInfo, setTeamInfo] = useState({ name: "Leader" });
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);

  useEffect(() => {
    // Initial fetch
    fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/open/api/admin/broadcasts`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setBroadcasts(data.data);
      });

    // Real-time listener
    socket.on('new-broadcast', (broadcast) => {
      console.log("📢 Received Broadcast via Socket:", broadcast);
      setBroadcasts(prev => [broadcast, ...prev]);
      // Optional toast or notification could be added here
    });

    socket.on('connect', () => console.log("✅ Socket Connected"));
    socket.on('connect_error', (err) => console.error("❌ Socket Connection Error:", err));

    return () => {
      socket.off('new-broadcast');
      socket.off('connect');
      socket.off('connect_error');
    };
  }, []);


  const openChat = (hackathon) => setActiveChat(hackathon);
  const closeChat = () => setActiveChat(null);

  useEffect(() => {
    // In a real app, you'd join a room based on teamId
    // For this demo, we'll just listen for any mentor joining
    socket.on('mentor-request-accepted', (data) => {
      // data contains request info and room_id
      setMentorNotification({
        mentorName: "A Mentor", // Could be enhanced to include mentor name from backend
        roomId: data.room_id,
        message: "Your request has been accepted. Join the meeting to discuss your project!"
      });
    });

    return () => socket.off('mentor-request-accepted');
  }, []);

  useEffect(() => {
    if (teamId) {
      setIsLoadingTeam(true);
      fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/open/api/team/all-teams`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const currentTeam = data.data.find(t => String(t.team_id) === teamId);
            if (currentTeam) {
              setTeamInfo(currentTeam);
            }
          }
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoadingTeam(false));
    }
  }, [teamId]);

  const handleRequestMentor = async () => {
    try {
      // Use actual teamId from params if available, else fallback to 10 for demo purposes
      const requestTeamId = teamId ? parseInt(teamId) : 10;
      const user_id = 5;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/open/api/mentor/request-mentoring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: requestTeamId, user_id })
      });

      const data = await response.json();
      if (data.success) {
        alert("Mentor request sent successfully! Please wait for a mentor to accept.");
      } else {
        alert("Failed to send mentor request: " + data.message);
      }
    } catch (error) {
      console.error("Mentor request error:", error);
      alert("Error connection to mentor service.");
    }
  };

  const handleJoinMeeting = () => {
    if (mentorNotification?.roomId) {
      navigate(`/call/${mentorNotification.roomId}`);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#090909] text-white font-sans">
        <Navbar onBack={closeChat} showBack={!!activeChat} />

      {/* Main content shifted below navbar */}
      <div className="pt-20 min-h-screen flex flex-col">
        {activeChat ? (
          /* ─── CHAT VIEW ─── */
          <div className="flex-1 flex flex-col h-[calc(100vh-5rem)]">
            <ChatView hackathon={activeChat} teamInfo={teamInfo} broadcasts={broadcasts} />
          </div>
        ) : (
          /* ─── DASHBOARD ─── */
          <main className="flex-1 px-4 sm:px-8 lg:px-16 py-8 max-w-7xl mx-auto w-full">

            {/* Hero greeting */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1 h-6 bg-red-600 rounded-full inline-block"></span>
                <span className="text-red-500 text-sm font-semibold tracking-widest uppercase">Dashboard</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
                {isLoadingTeam ? (
                    <span className="animate-pulse bg-gray-800 rounded h-12 w-64 inline-block"></span>
                ) : (
                    <>Welcome back, <span className="text-red-500">{teamInfo.name}</span> 👋</>
                )}
              </h1>
              <p className="text-gray-500 mt-2 text-base">Here's everything happening with your hackathon journey.</p>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <button 
                  onClick={handleRequestMentor}
                  className="bg-[#111] border border-red-900/40 hover:border-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all"
                >
                  <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                  Request Mentor Support
                </button>
              </div>
            </div>


            {/* Mentor Joined Notification */}
            {mentorNotification && (
              <div className="mb-10 bg-red-600/10 border border-red-600/40 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{mentorNotification.mentorName} joined!</h3>
                    <p className="text-gray-400 text-sm">{mentorNotification.message}</p>
                  </div>
                </div>
                <button 
                  onClick={handleJoinMeeting}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all whitespace-nowrap"
                >
                  Join Meeting Now
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
              <StatCard icon="⚡" value={ongoingHackathons.length} label="Active Hackathons" />
              <StatCard icon="🏆" value={pastHackathons.length} label="Completed" />
              <StatCard icon="🥇" value="2" label="Podium Finishes" />
              <StatCard icon="🌟" value="Top 5%" label="Overall Rank" />
            </div>

            {/* Ongoing Hackathons */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <h2 className="text-white font-bold text-2xl">Ongoing Hackathons</h2>
                <span className="bg-red-600/20 border border-red-600/40 text-red-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {ongoingHackathons.length} Active
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {ongoingHackathons.map((h) => (
                  <HackathonCard
                    key={h.id}
                    hackathon={h}
                    type="ongoing"
                    onClick={() => openChat(h)}
                  />
                ))}
              </div>
            </section>

            {/* Past Hackathons */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-white font-bold text-2xl">Past Hackathons</h2>
                <span className="bg-gray-800/60 border border-gray-700/40 text-gray-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {pastHackathons.length} Completed
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {pastHackathons.map((h) => (
                  <HackathonCard
                    key={h.id}
                    hackathon={h}
                    type="past"
                  />
                ))}
              </div>
            </section>
          </main>
        )}
      </div>

    </div>
    </>
  );
};

export default UserPage;