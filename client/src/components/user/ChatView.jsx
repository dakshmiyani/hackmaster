import React, { useState, useEffect, useRef } from 'react';
import { FaGithub } from "react-icons/fa";


/* ─── Mock admin messages ─── */
const allMessages = [
  { id: 1, text: 'Welcome to CodeStorm 2026! We\'re excited to have all teams on board.', time: '09:00 AM', type: 'announcement' },
  { id: 2, text: 'Round 1 has officially begun. You have 3 hours to complete your initial prototype.', time: '09:05 AM', type: 'alert' },
  { id: 3, text: 'Reminder: All teams must submit their GitHub repo links by 11:00 AM.', time: '10:00 AM', type: 'reminder' },
  { id: 4, text: 'Lunch break from 1:00 PM – 2:00 PM. Mentors will be available online during this time.', time: '12:45 PM', type: 'info' },
  { id: 5, text: 'Round 2 is starting now! Focus on UI/UX and presentation. Judges will begin evaluating at 4:00 PM.', time: '02:00 PM', type: 'alert' },
  { id: 6, text: '⚠️ Final submission deadline is at 5:30 PM. No extensions will be granted.', time: '04:30 PM', type: 'warning' },
  { id: 7, text: '🏆 Congratulations to all participants! Results will be announced at 6:00 PM in the main hall.', time: '05:45 PM', type: 'announcement' },
];

const msgTypeStyles = {
  announcement: { border: 'border-red-500/40', bg: 'bg-red-950/20', icon: '📢', label: 'Announcement', labelColor: 'text-red-400' },
  alert: { border: 'border-orange-500/40', bg: 'bg-orange-950/20', icon: '🚨', label: 'Alert', labelColor: 'text-orange-400' },
  reminder: { border: 'border-yellow-500/40', bg: 'bg-yellow-950/20', icon: '⏰', label: 'Reminder', labelColor: 'text-yellow-400' },
  info: { border: 'border-blue-500/40', bg: 'bg-blue-950/20', icon: 'ℹ️', label: 'Info', labelColor: 'text-blue-400' },
  warning: { border: 'border-red-600/60', bg: 'bg-red-900/30', icon: '⚡', label: 'Warning', labelColor: 'text-red-300' },
};

/* ─── Single Message Bubble ─── */
const MessageBubble = ({ msg, isLatest }) => {
  const style = msgTypeStyles[msg.type] || msgTypeStyles.info;
  return (
    <div className={`relative flex flex-col gap-2 rounded-2xl border p-4 transition-all duration-300 ${style.border} ${style.bg} ${isLatest ? 'ring-2 ring-red-600/50 shadow-lg shadow-red-950/40' : 'opacity-60'}`}>
      {isLatest && (
        <span className="absolute -top-3 left-4 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
          </span>
          Latest
        </span>
      )}
      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${style.labelColor}`}>
          <span>{style.icon}</span>
          Admin — {style.label}
        </span>
        <span className="text-gray-600 text-xs">{msg.time}</span>
      </div>
      <p className="text-gray-100 text-sm leading-relaxed">{msg.text}</p>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Mentor Request Button
   – Self-contained cooldown via localStorage
   – SVG circular ring drains over 120 s
   – Persists across page refreshes
───────────────────────────────────────────── */
const COOLDOWN_DURATION = 120;            // seconds
const STORAGE_KEY = 'mentorCooldownEnd'; // localStorage key
const RADIUS = 20;                       // SVG circle radius
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 125.66

const MentorRequestButton = ({ onRequest, mentorOnline }) => {
  // Restore cooldownEnd from localStorage on mount (persists page refresh)
  const [cooldownEnd, setCooldownEnd] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = parseInt(stored, 10);
    // Discard stale timestamps that have already expired
    return parsed > Date.now() ? parsed : null;
  });

  // Tick state — re-renders the component every second
  const [now, setNow] = useState(Date.now);

  // Mock queue position (in a real app this comes from the server)
  const [queuePosition] = useState(() => Math.floor(Math.random() * 5) + 2);

  // ── Ticker: update `now` every second ──────────────────────────
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Derived values ─────────────────────────────────────────────
  const remainingMs = cooldownEnd ? cooldownEnd - now : 0;
  const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
  const inCooldown = remainingSec > 0;

  // Progress 0 → 1 as elapsed time grows ( ring fills clockwise )
  const elapsed = COOLDOWN_DURATION - remainingSec;
  const progress = inCooldown ? elapsed / COOLDOWN_DURATION : 0;
  // strokeDashoffset shrinks from CIRCUMFERENCE → 0
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  // ── Helpers ────────────────────────────────────────────────────
  /** Format seconds as mm:ss */
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── Handlers ───────────────────────────────────────────────────
  const handleRequest = () => {
    const end = Date.now() + COOLDOWN_DURATION * 1000;
    setCooldownEnd(end);
    localStorage.setItem(STORAGE_KEY, end.toString());
    onRequest?.(); // notify parent (triggers mentor-accept notification)
  };

  // ── Button style variants ───────────────────────────────────────
  const btnClass = inCooldown
    ? 'bg-[#1a1a1a] text-gray-400 border border-gray-700/60 cursor-not-allowed min-w-[152px] justify-center'
    : mentorOnline
      ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50 hover:shadow-red-800/60 hover:scale-105 active:scale-95'
      : 'bg-gray-800/60 text-gray-600 border border-gray-800 cursor-not-allowed';

  return (
    <div className="flex flex-col items-center gap-2">

      {/* ── Online / Offline indicator ── */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {mentorOnline && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${mentorOnline ? 'bg-green-400' : 'bg-gray-600'
            }`} />
        </span>
        <span className={`text-xs font-medium ${mentorOnline ? 'text-green-400' : 'text-gray-500'
          }`}>
          Mentor {mentorOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* ── Button + SVG ring wrapper ── */}
      <div className="relative inline-flex items-center justify-center">


        {/* ── The actual button ── */}
        <button
          id="request-mentor-btn"
          onClick={handleRequest}
          disabled={inCooldown || !mentorOnline}
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${btnClass}`}
        >
          {inCooldown ? (
            /* Cooldown state: clock icon + mm:ss countdown */
            <>
              <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Retry in {formatTime(remainingSec)}
            </>
          ) : (
            /* Default / active state */
            <>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Request Mentor
            </>
          )}
        </button>
      </div>

      {/* ── Queue position — shown during cooldown ── */}
      {inCooldown && (
        <p className="text-gray-600 text-xs text-center leading-relaxed">
          Queue position:{' '}
          <span className="text-red-400 font-semibold">#{queuePosition}</span>
          {'  ·  '}
          Est. wait:{' '}
          <span className="text-gray-400 font-medium">
            {queuePosition * 3}–{queuePosition * 5} min
          </span>
        </p>
      )}
    </div>
  );
};

/* ─── Mentor Accepted Notification ─── */
const MentorNotification = ({ visible, onDismiss }) => {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onDismiss, 8000);
      return () => clearTimeout(t);
    }
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div
      id="mentor-notification"
      className="fixed bottom-6 right-6 z-50 flex items-start gap-4 bg-[#111] border border-green-600/50 rounded-2xl p-4 shadow-2xl shadow-green-950/60 max-w-sm"
      style={{ animation: 'slideUp 0.3s ease-out' }}
    >
      <div className="w-10 h-10 rounded-full bg-green-900/40 border border-green-700/40 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-green-400 font-semibold text-sm">Mentor Session Accepted! 🎉</p>
        <p className="text-gray-400 text-xs mt-0.5">Dr. Ananya Sharma has accepted your mentoring request. Join the session now.</p>
        <button
          id="join-session-btn"
          className="mt-2 text-xs bg-green-700/30 hover:bg-green-700/50 border border-green-700/40 text-green-300 px-3 py-1 rounded-lg transition-colors duration-150"
        >
          Join Session →
        </button>
      </div>
      <button onClick={onDismiss} className="text-gray-600 hover:text-gray-400 transition-colors mt-0.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

/* ─── Main Chat View ─── */
const ChatView = ({ hackathon, teamInfo, broadcasts = [] }) => {
  // Combine mock messages with real broadcasts
  // Map real broadcasts to match MessageBubble format
  const realMessages = broadcasts.map(b => ({
    id: `real-${b.broadcast_id}`,
    text: b.message,
    time: new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: 'announcement' // New broadcasts default to announcement style
  })).reverse(); // Reverse because broadcasts state is latest-first, but chat feed is oldest-first

  const combinedMessages = [...allMessages, ...realMessages];
  
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [mentorOnline] = useState(true);
  const latestMsg = combinedMessages.length > 0 ? combinedMessages[combinedMessages.length - 1] : null;
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Called by MentorRequestButton when the user fires a request.
  // Simulate mentor accepting after 3 s and fire the toast notification.
  const handleMentorRequest = () => {
    setTimeout(() => setNotificationVisible(true), 3000);
  };
  const [repoModalOpen, setRepoModalOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState(teamInfo?.project_link || "");

  // Update repoUrl if teamInfo changes
  useEffect(() => {
    if (teamInfo?.project_link) {
      setRepoUrl(teamInfo.project_link);
    }
  }, [teamInfo]);

  return (
    <div className="flex flex-col h-[90dvh] overflow-hidden">
      {/* Chat Header */}
      <div className="shrink-0 bg-[#0d0d0d] border-b border-red-900/30 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className='flex items-center gap-12'>
            <div>
              <h2 className="text-white font-bold text-xl">{hackathon.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-red-400 text-xs font-medium">LIVE</span>
                </div>
                <span className="text-gray-600 text-xs">|</span>
                <span className="text-gray-400 text-xs">{hackathon.participants} participants</span>
                <span className="text-gray-600 text-xs">|</span>
                <span className="text-red-400 text-xs font-medium">⏱ {hackathon.timeRemaining}</span>
              </div>
            </div>
            <button
              onClick={() => setRepoModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-red-600 text-white hover:bg-red-500 hover:scale-105 active:scale-95"
            >
              <FaGithub className="text-white w-6 h-6" />
              {teamInfo?.project_link ? "Edit your repo" : "Add your repo"}
            </button>
            {repoModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

                <div className="bg-[#111] border border-red-900/40 rounded-2xl p-6 w-[400px] shadow-2xl">

                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaGithub className="text-white w-5 h-5" />
                    Submit GitHub Repository
                  </h3>

                  <input
                    type="url"
                    placeholder="https://github.com/username/project"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-red-500"
                  />

                  <div className="flex justify-end gap-3 mt-5">

                    <button
                      onClick={() => setRepoModalOpen(false)}
                      className="px-4 py-2 text-sm rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800"
                    >
                      Cancel
                    </button>


                    <button
                      onClick={async () => {
                        if (!repoUrl.startsWith("https://github.com/")) {
                          alert("Please enter a valid GitHub repository URL");
                          return;
                        }
                        
                        try {
                           const isUpdate = !!teamInfo?.project_link;
                           const url = isUpdate 
                            ? `${import.meta.env.VITE_BACKEND_BASE_URL}/open/api/team/update`
                            : `${import.meta.env.VITE_BACKEND_BASE_URL}/open/api/team/create`;
                           
                           const method = isUpdate ? 'PUT' : 'POST';
                           const payload = isUpdate 
                            ? { team_id: teamInfo.team_id, project_link: repoUrl }
                            : {
                                name: teamInfo?.name || "Code brokers",
                                event_id: teamInfo?.event_id || 2,
                                organization_id: teamInfo?.organization_id || 2,
                                project_link: repoUrl
                              };

                           const response = await fetch(url, {
                                method: method,
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                           });
                           
                           const data = await response.json();
                           if (data.success) {
                               alert(isUpdate ? "Repo updated successfully!" : "Repo added successfully!");
                               setRepoModalOpen(false);
                               if (data.data?.team_id || (isUpdate && teamInfo.team_id)) {
                                   window.location.reload(); 
                               }
                           } else {
                               alert(`Failed to ${isUpdate ? 'update' : 'add'} repo: ` + data.message);
                           }
                        } catch(error) {
                           console.error("Submit error", error);
                           alert("Error connecting to server");
                        }
                        
                      }}
                      className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-500 text-white"
                    >
                      {teamInfo?.project_link ? "Update Repo" : "Submit Repo"}
                    </button>

                  </div>

                </div>

              </div>
            )}
          </div>

          <MentorRequestButton
            mentorOnline={mentorOnline}
            onRequest={handleMentorRequest}
          />
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-thin scrollbar-thumb-red-900/40 scrollbar-track-transparent">
        {/* <div className="text-center mb-6">
          <span className="text-xs text-gray-600 bg-[#111] border border-[#222] px-4 py-1.5 rounded-full">
            📋 Admin Broadcast Channel — Read Only
          </span>
        </div> */}
        <div className='overflow-y-scroll border p-2 rounded-xl border-red-900/30 gap-5 flex flex-col h-[65vh]'>
          {combinedMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isLatest={latestMsg && msg.id === latestMsg.id}
            />
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Bottom Bar */}
      <div className="shrink-0 bg-[#0d0d0d] border-t border-red-900/30 px-6 py-3">
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-gray-600 text-xs">This is a read-only broadcast channel. Only admins can send messages.</span>
        </div>
      </div>

      <MentorNotification
        visible={notificationVisible}
        onDismiss={() => setNotificationVisible(false)}
      />
    </div>
  );
};

export default ChatView;
