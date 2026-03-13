import React, { useState } from 'react';
import Navbar from '../components/user/Navbar';
import HackathonCard from '../components/user/HackathonCard';
import ChatView from '../components/user/ChatView';

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
  const [activeChat, setActiveChat] = useState(null);

  const openChat = (hackathon) => setActiveChat(hackathon);
  const closeChat = () => setActiveChat(null);

  return (
    <div className="min-h-screen bg-[#090909] text-white font-sans">
      <Navbar onBack={closeChat} showBack={!!activeChat} />

      {/* Main content shifted below navbar */}
      <div className="pt-20 min-h-screen flex flex-col">
        {activeChat ? (
          /* ─── CHAT VIEW ─── */
          <div className="flex-1 flex flex-col h-[calc(100vh-5rem)]">
            <ChatView hackathon={activeChat} />
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
                Welcome back, <span className="text-red-500">Alex</span> 👋
              </h1>
              <p className="text-gray-500 mt-2 text-base">Here's everything happening with your hackathon journey.</p>
            </div>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
  );
};

export default UserPage;