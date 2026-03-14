import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  Users, Clock, Maximize2, Shield, Settings,
  Monitor, MonitorOff
} from 'lucide-react'
import socket from '../utils/socket'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/MentorComponents/button'
import { Card } from '@/components/MentorComponents/card'
import { Badge } from '@/components/MentorComponents/badge'

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
}

export default function CallPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  
  // Refs
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const pcRef = useRef(null)
  const localStreamRef = useRef(null)

  // State
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isSharingScreen, setIsSharingScreen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isMentor, setIsMentor] = useState(false)
  const candidateQueue = useRef([])

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const { user } = useAuth()

  // WebRTC Initialization
  useEffect(() => {
    // Set role based on auth context
    if (user) {
        setIsMentor(user.role_id === 4)
    }

    const initCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        })
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // Join socket room
        console.log('[CALL] Joining room:', roomId)
        socket.emit('join-room', roomId, socket.id)

        // WebRTC Signaling Handlers
        socket.on('user-connected', async (userId) => {
          console.log('[CALL] Peer connected, creating offer:', userId)
          await createOffer()
        })

        socket.on('offer', async (offer) => {
          console.log('[CALL] Received offer')
          await handleOffer(offer)
        })

        socket.on('answer', async (answer) => {
          console.log('[CALL] Received answer')
          if (pcRef.current) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer))
            processCandidateQueue()
          }
        })

        socket.on('ice-candidate', async (candidate) => {
          console.log('[CALL] Received ICE candidate')
          if (pcRef.current && pcRef.current.remoteDescription) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate))
          } else {
            candidateQueue.current.push(candidate)
          }
        })

        socket.on('user-disconnected', () => {
          console.log('[CALL] Peer disconnected')
          setIsConnected(false)
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
        })
      } catch (err) {
        console.error('Error accessing media devices:', err)
      }
    }

    initCall()

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (pcRef.current) {
        pcRef.current.close()
        pcRef.current = null
      }
      socket.off('user-connected')
      socket.off('offer')
      socket.off('answer')
      socket.off('ice-candidate')
      socket.off('user-disconnected')
    }
  }, [roomId])

  const processCandidateQueue = async () => {
    while (candidateQueue.current.length > 0) {
      const candidate = candidateQueue.current.shift()
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate))
    }
  }

  const setupPeerConnection = () => {
    console.log('[CALL] Setting up PeerConnection')
    const pc = new RTCPeerConnection(ICE_SERVERS)
    
    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current)
    })

    pc.ontrack = (event) => {
      console.log('[CALL] Received remote track')
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[CALL] Sending ICE candidate')
        socket.emit('ice-candidate', { roomId, candidate: event.candidate })
      }
    }

    pc.onconnectionstatechange = () => {
        console.log('[CALL] Connection state:', pc.connectionState)
        if (pc.connectionState === 'connected') {
            setIsConnected(true)
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            setIsConnected(false)
        }
    }

    pcRef.current = pc
    return pc
  }

  const createOffer = async () => {
    const pc = setupPeerConnection()
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socket.emit('offer', { roomId, offer })
  }

  const handleOffer = async (offer) => {
    const pc = setupPeerConnection()
    await pc.setRemoteDescription(new RTCSessionDescription(offer))
    processCandidateQueue()
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    socket.emit('answer', { roomId, answer })
  }

  const toggleMic = () => {
    const audioTrack = localStreamRef.current.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      setIsMuted(!audioTrack.enabled)
    }
  }

  const toggleCamera = () => {
    const videoTrack = localStreamRef.current.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      setIsCameraOff(!videoTrack.enabled)
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (!isSharingScreen) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        const screenTrack = screenStream.getVideoTracks()[0]

        if (pcRef.current) {
          const sender = pcRef.current.getSenders().find(s => s.track.kind === 'video')
          if (sender) {
            sender.replaceTrack(screenTrack)
          }
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
        }

        screenTrack.onended = () => stopScreenShare()
        setIsSharingScreen(true)
      } else {
        stopScreenShare()
      }
    } catch (err) {
      console.error('Error starting screen share:', err)
    }
  }

  const stopScreenShare = async () => {
    try {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (pcRef.current) {
        const sender = pcRef.current.getSenders().find(s => s.track.kind === 'video')
        if (sender) {
          sender.replaceTrack(videoTrack)
        }
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current
      }

      setIsSharingScreen(false)
    } catch (err) {
      console.error('Error stopping screen share:', err)
    }
  }

  const endCall = () => {
    if (user?.role_id === 4) {
      navigate('/mentor')
    } else if (user?.role_id === 5) {
      navigate(user.team_id ? `/team-leader/${user.team_id}` : '/team-leader')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden flex flex-col font-sans">
      {/* Top Bar */}
      <div className="h-20 border-b border-white/5 bg-black/50 backdrop-blur-md px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/20">
            <span className="font-black text-xs">HM</span>
          </div>
          <div>
            <h1 className="font-bold tracking-tight">HackMaster</h1>
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Premium Mentoring</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-red-950/20 border border-red-900/40 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-gray-300 uppercase">Live Session</span>
          </div>
          <div className="bg-[#111] border border-white/5 px-4 py-1.5 rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-600" />
            <span className="font-mono font-bold text-sm">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-white/10 bg-white/5 text-gray-400 font-mono hidden md:flex">
            ROOM: {roomId?.slice(0, 8)}...
          </Badge>
          <Button variant="ghost" size="icon" className="hover:bg-white/5">
            <Settings className="w-5 h-5 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-[#050505] p-6">
        {/* Main Remote Video */}
        <div className="w-full h-full rounded-3xl overflow-hidden bg-[#0a0a0a] border border-white/5 relative group">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          
          {!isConnected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 px-8 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-600/20 blur-3xl rounded-full"></div>
                <Users className="w-20 h-20 text-red-600 relative animate-pulse" />
              </div>
              <h2 className="text-xl font-bold mb-2">
                {isMentor ? "Waiting for Team Leader" : "Waiting for Mentor"}
              </h2>
              <p className="text-gray-500 text-sm max-w-xs">Connecting to secure peer-to-peer session. Please ensure your camera and microphone are enabled.</p>
            </div>
          )}

          {/* User info overlay */}
          <div className="absolute bottom-6 left-6 flex items-center gap-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-10 w-10 bg-gray-900 rounded-full border border-white/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-red-600" />
            </div>
            <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
              <span className="text-xs font-bold">Remote Peer</span>
            </div>
          </div>
        </div>

        {/* Picture-in-Picture Local Video */}
        <Card className="absolute bottom-10 right-10 w-48 sm:w-64 aspect-[4/3] rounded-2xl overflow-hidden border-2 border-red-600/30 shadow-2xl shadow-red-600/10 z-40 bg-black">
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : ''}`}
          />
          {isCameraOff && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a]">
              <VideoOff className="w-10 h-10 text-red-900/50 mb-2" />
              <span className="text-[10px] font-bold text-gray-600 px-3 text-center uppercase tracking-widest">Camera Disabled</span>
            </div>
          )}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
              <span className="text-[10px] font-bold">You (Self)</span>
            </div>
            {isMuted && <MicOff className="w-3.5 h-3.5 text-red-500" />}
          </div>
        </Card>
      </div>

      {/* Control Bar */}
      <div className="h-28 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-center gap-6 px-6 relative">
        <div className="flex flex-col items-center gap-2">
          <Button 
            onClick={toggleMic}
            variant="outline" 
            size="icon" 
            className={`h-14 w-14 rounded-2xl transition-all duration-300 ${
              isMuted 
              ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' 
              : 'bg-[#111] border-white/10 text-gray-400 hover:border-red-600/50'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mute</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button 
            onClick={toggleCamera}
            variant="outline" 
            size="icon" 
            className={`h-14 w-14 rounded-2xl transition-all duration-300 ${
              isCameraOff 
              ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' 
              : 'bg-[#111] border-white/10 text-gray-400 hover:border-red-600/50'
            }`}
          >
            {isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </Button>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Camera</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button 
            onClick={toggleScreenShare}
            variant="outline" 
            size="icon" 
            className={`h-14 w-14 rounded-2xl transition-all duration-300 ${
              isSharingScreen 
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
              : 'bg-[#111] border-white/10 text-gray-400 hover:border-red-600/50'
            }`}
          >
            {isSharingScreen ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
          </Button>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Screen</span>
        </div>

        <div className="mx-4 h-12 w-px bg-white/5 hidden sm:block"></div>

        <div className="flex flex-col items-center gap-2">
          <Button 
            onClick={endCall}
            className="h-16 w-16 sm:w-32 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-2xl shadow-red-600/40 transition-all duration-300 flex flex-col"
          >
            <PhoneOff className="w-7 h-7 mb-1" />
            <span className="hidden sm:block text-[10px] font-black uppercase tracking-tighter">End Session</span>
          </Button>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest sm:hidden">Quit</span>
        </div>
      </div>
    </div>
  )
}
