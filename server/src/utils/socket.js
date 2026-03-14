const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, '../../../socket-debug.log');

const log = (msg) => {
  const time = new Date().toISOString();
  fs.appendFileSync(logFile, `[${time}] ${msg}\n`);
  console.log(msg);
};

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on('connection', (socket) => {
    log(`Socket connected: ${socket.id}`);

    socket.onAny((event, ...args) => {
      log(`[SOCKET DEBUG] 📥 Received Event: ${event} from ${socket.id} with args: ${JSON.stringify(args)}`);
    });

    // Leader joins their team room to receive notifications
    socket.on('join-team-room', (teamId) => {
      socket.join(`team-${teamId}`);
      log(`[SOCKET DEBUG] Socket ${socket.id} joined team-${teamId}`);
      // Check room members
      const clients = io.sockets.adapter.rooms.get(`team-${teamId}`);
      log(`[SOCKET DEBUG] Current members in team-${teamId}: ${clients ? Array.from(clients).join(', ') : 'none'}`);
    });

    // Both mentor + leader join the video call room
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);
      log(`[SOCKET DEBUG] Socket ${socket.id} joined room ${roomId}`);

      const clients = io.sockets.adapter.rooms.get(roomId);
      const numClients = clients ? clients.size : 0;

      if (numClients > 1) {
        // Someone was already here. Tell THEM that a new peer joined.
        // They will be the initiator (caller).
        log(`[SOCKET DEBUG] Room ${roomId} has ${numClients} clients. Emitting peer-joined.`);
        socket.to(roomId).emit('peer-joined', socket.id);
      }

      socket.on('disconnect', () => {
        log(`[SOCKET DEBUG] Socket ${socket.id} disconnected from room ${roomId}`);
        socket.to(roomId).emit('user-disconnected', socket.id);
      });
    });

    // WebRTC Signaling
    socket.on('offer', ({ roomId, offer }) => {
      log(`[SIGNALING] Offer from ${socket.id} to room ${roomId}`);
      socket.to(roomId).emit('offer', offer);
    });

    socket.on('answer', ({ roomId, answer }) => {
      log(`[SIGNALING] Answer from ${socket.id} to room ${roomId}`);
      socket.to(roomId).emit('answer', answer);
    });

    socket.on('ice-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('ice-candidate', candidate);
    });

    // Mentor calls a team leader
    socket.on('call-leader', ({ teamId, roomId, mentorName }) => {
      log(`[SOCKET DEBUG] Mentor calling team-${teamId} in room ${roomId}`);
      socket.to(`team-${teamId}`).emit('incoming-call', { roomId, mentorName });
    });

    // Leader accepts the call (optional, but good for feedback)
    socket.on('accept-call', ({ teamId, roomId }) => {
      log(`[SOCKET DEBUG] Leader of team-${teamId} accepted call in ${roomId}`);
      socket.to(roomId).emit('call-accepted', { teamId });
    });

  });

  // Periodically log rooms for debugging
  setInterval(() => {
    log('--- [SOCKET ROOMS DEBUG] ---');
    if (!io) return;
    const rooms = io.sockets.adapter.rooms;
    rooms.forEach((val, key) => {
      if (key.startsWith('team-')) {
        log(`Room: ${key}, Members: ${Array.from(val).join(', ')}`);
      }
    });
    log('----------------------------');
  }, 10000);

  return io;
};

// Export getIO so router can use it
const getIO = () => {
  if (!io) throw new Error('Socket not initialized');
  return io;
};

module.exports = { initSocket, getIO };