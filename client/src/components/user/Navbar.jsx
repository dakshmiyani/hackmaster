import React, { useState } from 'react';
import ProfileDropdown from './ProfileDropdown';

const Navbar = ({ onBack, showBack }) => {
  const [profileOpen, setProfileOpen] = useState(false);

  const user = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar: 'AJ',
    team: {
      name: 'NullPointers',
      members: ['Alex Johnson', 'Sara Mehta', 'Rohan Das', 'Priya Kapoor'],
      domain: 'AI / ML',
      teamId: 'NP-2026-042',
    },
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/90 backdrop-blur-md border-b border-red-900/40">
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors duration-200 mr-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">HackMaster</span>
        </div>
      </div>

      <div className="relative">
        <button
          id="profile-btn"
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-3 group"
        >
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-white text-sm font-semibold leading-tight">{user.name}</span>
            <span className="text-red-400 text-xs">{user.team.name}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-sm ring-2 ring-red-700/50 group-hover:ring-red-500 transition-all duration-200 shadow-lg shadow-red-900/30">
            {user.avatar}
          </div>
        </button>

        {profileOpen && (
          <ProfileDropdown
            user={user}
            onClose={() => setProfileOpen(false)}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
