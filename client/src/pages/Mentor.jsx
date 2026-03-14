"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Users, Clock, CheckCircle, Inbox, Code, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/MentorComponents/card"
import { Button } from "@/components/MentorComponents/button"
import { Badge } from "@/components/MentorComponents/badge"

import socket from "../utils/socket"
import { useAuth } from "../context/AuthContext"

const domains = ["All", "AI/ML", "Web Dev", "IoT", "Fintech", "DevOps"]

export default function MentorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [teams, setTeams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDomain, setSelectedDomain] = useState("All")
  const [view, setView] = useState("requests") // "requests" or "teams"

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/open/api/mentor/pending-requests`)
      const data = await response.json()
      if (data.success) {
        // Map backend fields to frontend fields
        const mapped = data.data.map(r => ({
          id: r.id,
          teamId: r.team_id, // Ensure teamId is available
          teamName: r.team_name,
          leaderName: r.leader_name,
          domain: "AI/ML", // Backend doesn't have domain yet, defaulting to AI/ML
          problemStatement: "Request from " + r.team_name,
          requestTime: new Date(r.created_at).toLocaleTimeString(),
          status: r.is_served ? "accepted" : "pending"
        }))
        setRequests(mapped)
      }
    } catch (error) {
      console.error("Fetch requests error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptRequest = async (id) => {
    console.log("ACCEPT REQUEST CALLED WITH ID:", id);
    try {
      // Mocking mentor_id if not present in user object
      const mentor_id = user?.user_id || 1; 

      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/open/api/mentor/accept-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: id, mentor_id })
      })

      const data = await response.json()
      if (data.success) {
        // Redirect to call page with the generated room_id
        navigate(`/call/${data.data.room_id}`)
      } else {
        alert("Failed to accept request: " + data.message)
      }
    } catch (error) {
      console.error("Accept error:", error)
      alert("Error connecting to mentor service.")
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/open/api/team/all-teams`)
      const data = await response.json()
      if (data.success) {
        setTeams(data.data)
      }
    } catch (error) {
      console.error("Fetch teams error:", error)
    }
  }

  useEffect(() => {
    fetchRequests()
    fetchTeams()
    
    socket.on('new-mentor-request', (request) => {
      console.log("🆕 New mentor request via socket:", request);
      alert("NEW MENTOR REQUEST ARRIVED!");
      fetchRequests(); 
    });

    return () => {
      socket.off('new-mentor-request');
    };
  }, [])

  const handleCallTeam = (teamId) => {
    const roomId = `call-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    console.log(`[MENTOR] Calling team ${teamId} in room ${roomId}`)
    socket.emit('call-leader', { 
        teamId, 
        roomId, 
        mentorName: user?.name || "Mentor" 
    })
    navigate(`/call/${roomId}`)
  }

  const filteredRequests = requests.filter((r) => 
    selectedDomain === "All" || r.domain === selectedDomain
  )

  const pendingCount = requests.filter((r) => r.status === "pending").length
  const acceptedCount = requests.filter((r) => r.status === "accepted").length

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-black/95 backdrop-blur supports-backdrop-filter:bg-black/60">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-600/20">
              <Code className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Mentor Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-red-900/50 bg-red-950/20 px-3 py-1 text-xs font-semibold text-red-500">
              {pendingCount} Pending
            </Badge>
            <Badge variant="outline" className="border-emerald-900/50 bg-emerald-950/20 px-3 py-1 text-xs font-semibold text-emerald-500">
              {acceptedCount} Accepted
            </Badge>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={fetchRequests} 
                className={`ml-2 text-gray-400 hover:text-white ${isLoading ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/5">
          <button 
            onClick={() => setView("requests")}
            className={`pb-4 px-2 text-sm font-bold transition-all ${view === "requests" ? "text-red-500 border-b-2 border-red-500" : "text-gray-500 hover:text-gray-300"}`}
          >
            PENDING REQUESTS ({pendingCount})
          </button>
          <button 
            onClick={() => setView("teams")}
            className={`pb-4 px-2 text-sm font-bold transition-all ${view === "teams" ? "text-red-500 border-b-2 border-red-500" : "text-gray-500 hover:text-gray-300"}`}
          >
            ALL TEAMS ({teams.length})
          </button>
        </div>

        {/* Section Header */}
        <div className="flex flex-col gap-6 mb-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
              {view === "requests" ? (
                <>
                  <Inbox className="h-6 w-6 text-red-600" />
                  Mentoring Requests
                </>
              ) : (
                <>
                  <Users className="h-6 w-6 text-red-600" />
                  All Participating Teams
                </>
              )}
            </h2>
            <p className="mt-2 text-gray-400">
              {view === "requests" ? "Review and accept team mentoring requests" : "Browse all teams and initiate a direct call"}
            </p>
          </div>
          
          {/* Domain Filter */}
          <div className="flex flex-wrap gap-2 sm:mt-1">
            {domains.map((domain) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  selectedDomain === domain
                    ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20"
                    : "bg-black border-red-900/30 text-gray-400 hover:border-red-600/50 hover:text-red-400"
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium">Loading...</p>
            </div>
          ) : view === "requests" ? (
            filteredRequests.length === 0 ? <EmptyState /> : (
              filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAcceptRequest} // Use handleAcceptRequest for existing requests
                />
              ))
            )
          ) : (
            teams.length === 0 ? <p className="text-center text-gray-500 py-10">No teams found.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <TeamCard key={team.team_id} team={team} onCall={() => handleCallTeam(team.team_id)} />
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  )
}

function RequestCard({ request, onAccept }) {
  const isAccepted = request.status === "accepted"

  return (
    <Card className="group border-border bg-[#0a0a0a] transition-all duration-300 hover:border-red-600/30 hover:shadow-2xl hover:shadow-red-600/5">
      <CardContent className="flex gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        {/* Left Section - Team Info */}
        <div className="flex items-start gap-6 flex-1 min-w-0">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#111] border border-white/5 text-red-600 transition-transform group-hover:scale-110">
            <Users className="h-8 w-8" />
          </div>
          <div className="space-y-4 min-w-0 flex-1">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-bold text-white tracking-tight truncate">
                  {request.teamName || request.team_name}
                </h3>
                {isAccepted && (
                  <Badge className="bg-emerald-600 text-white border-none shadow-lg shadow-emerald-600/20">
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    Accepted
                  </Badge>
                )}
              </div>
              <p className="text-gray-400 font-medium truncate">
                Led by {request.leaderName || request.leader_name}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="w-fit h-7 border-red-900/30 bg-red-950/10 px-3 text-xs font-semibold text-red-500">
                {request.domain}
              </Badge>
              <div className="flex items-center gap-2 text-gray-300">
                <Code className="h-4 w-4 text-red-600 shrink-0" />
                <span className="text-sm font-medium truncate">{request.problemStatement}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Time & Action */}
        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center sm:shrink-0">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Clock className="h-4 w-4 text-red-600/50" />
           <span>{request.requestTime || new Date(request.created_at).toLocaleTimeString()}</span>
          </div>
          <Button
            onClick={() => {
                console.log("ACCEPT CLICKED FOR ID:", request.id);
                onAccept(request.id);
            }}
            disabled={isAccepted}
            className={isAccepted
              ? "h-12 w-full sm:w-44 cursor-not-allowed bg-emerald-600/10 text-emerald-500 border border-emerald-900/30"
              : "h-12 w-full sm:w-44 bg-linear-to-r from-red-600 to-red-700 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-105 transition-all duration-300 border-none"
            }
          >
            {isAccepted ? "Accepted" : "Accept Request"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TeamCard({ team, onCall }) {
  return (
    <Card className="bg-[#0a0a0a] border-white/5 hover:border-red-600/30 transition-all p-6 group">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-red-600/20 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{team.team_name}</h3>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Team ID: {team.team_id}</p>
          </div>
        </div>
        
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Domain</span>
                <Badge variant="outline" className="border-red-900/30 text-red-500 bg-red-950/10">General</Badge>
            </div>
        </div>

        <Button 
          onClick={onCall}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11 rounded-lg"
        >
          Call Team Leader
        </Button>
      </div>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card className="border-dashed border-border bg-card/50">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-foreground">
          No mentoring requests yet
        </h3>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          When teams request your mentorship, they will appear here.
        </p>
      </CardContent>
    </Card>
  )
}
