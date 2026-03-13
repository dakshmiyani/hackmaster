import React, { useEffect, useRef } from 'react';

const ProfileDropdown = ({ user, onClose }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !document.getElementById('profile-btn').contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-14 w-80 bg-[#111] border border-red-900/50 rounded-2xl shadow-2xl shadow-red-950/60 overflow-hidden animate-in"
      style={{ animation: 'dropIn 0.2s ease-out' }}
    >
      {/* Header */}
      <div className="bg-linear-to-r from-red-950/60 to-black p-5 border-b border-red-900/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-linear-to-br from-red-500 to-red-800 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-900/50">
            {user.avatar}
          </div>
          <div>
            <p className="text-white font-bold text-base">{user.name}</p>
            <p className="text-red-400 text-xs mt-0.5">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-red-400 text-xs font-semibold uppercase tracking-widest">Team Details</span>
        </div>

        <div className="bg-black/60 rounded-xl p-4 border border-red-900/20 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Team Name</span>
            <span className="text-white font-semibold text-sm">{user.team.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Team ID</span>
            <span className="text-red-400 font-mono text-xs">{user.team.teamId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Domain</span>
            <span className="text-white text-sm">{user.team.domain}</span>
          </div>

          <div>
            <span className="text-gray-500 text-sm block mb-2">Members</span>
            <div className="space-y-1.5">
              {user.team.members.map((member, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-red-700 to-red-900 flex items-center justify-center text-white text-xs font-bold">
                    {member.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-gray-300 text-sm">{member}</span>
                  {idx === 0 && (
                    <span className="ml-auto text-red-500 text-xs bg-red-950/40 px-1.5 py-0.5 rounded">You</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-5 pb-5">
        <button
          id="logout-btn"
          onClick={() => alert('Logging out…')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-700/20 hover:bg-red-600/30 border border-red-700/40 hover:border-red-500/60 text-red-400 hover:text-red-300 font-semibold text-sm transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ProfileDropdown;
