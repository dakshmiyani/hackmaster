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
      socket.to(roomId).emit('user-connected', userId);

      socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected', userId);
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
      log(`[SIGNALING] ICE Candidate from ${socket.id} to room ${roomId}`);
      socket.to(roomId).emit('ice-candidate', candidate);
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