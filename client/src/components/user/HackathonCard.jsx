import React from 'react';

const HackathonCard = ({ hackathon, onClick, type }) => {
  const isOngoing = type === 'ongoing';

  const statusStyles = isOngoing
    ? 'bg-red-600/20 text-red-400 border-red-600/40'
    : 'bg-gray-800/60 text-gray-400 border-gray-700/40';

  const cardGlow = isOngoing ? 'hover:shadow-red-900/40 hover:border-red-700/60' : 'hover:shadow-gray-900/40 hover:border-gray-700/60';

  return (
    <div
      id={`hackathon-card-${hackathon.id}`}
      onClick={onClick}
      className={`relative group bg-[#111] border border-[#222] rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-xl ${cardGlow} hover:-translate-y-1 overflow-hidden`}
    >
      {/* Glow background */}
      {isOngoing && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      {/* Live pulse for ongoing */}
      {isOngoing && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="text-red-400 text-xs font-semibold">LIVE</span>
        </div>
      )}

      {/* Header row */}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium mb-3 ${statusStyles}`}>
        {isOngoing ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {isOngoing ? 'Ongoing' : 'Completed'}
      </div>

      {/* Title */}
      <h3 className="text-white font-bold text-lg leading-snug mb-1 group-hover:text-red-100 transition-colors duration-200">
        {hackathon.name}
      </h3>
      <p className="text-gray-500 text-sm mb-4">{hackathon.tagline}</p>

      {/* Details row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-gray-600 text-xs">Domain</span>
          <span className="text-gray-300 text-sm font-medium">{hackathon.domain}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-gray-600 text-xs">Participants</span>
          <span className="text-gray-300 text-sm font-medium">{hackathon.participants}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-gray-600 text-xs">{isOngoing ? 'Time Remaining' : 'Duration'}</span>
          <span className={`text-sm font-medium ${isOngoing ? 'text-red-400' : 'text-gray-300'}`}>
            {isOngoing ? hackathon.timeRemaining : hackathon.duration}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-gray-600 text-xs">{isOngoing ? 'Prize Pool' : 'Rank'}</span>
          <span className="text-gray-300 text-sm font-medium">
            {isOngoing ? hackathon.prize : hackathon.rank}
          </span>
        </div>
      </div>

      {/* Team badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-red-800/40 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-gray-400 text-xs">{hackathon.team}</span>
        </div>

        {isOngoing && (
          <span className="flex items-center gap-1 text-red-400 text-xs font-medium group-hover:gap-2 transition-all duration-200">
            Open Chat
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
};

export default HackathonCard;
