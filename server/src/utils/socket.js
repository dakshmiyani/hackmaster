const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Leader joins their team room to receive notifications
    socket.on('join-team-room', (teamId) => {
      socket.join(`team-${teamId}`);
      console.log(`Socket ${socket.id} joined team-${teamId}`);
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
      socket.to(roomId).emit('offer', offer);
    });

    socket.on('answer', ({ roomId, answer }) => {
      socket.to(roomId).emit('answer', answer);
    });

    socket.on('ice-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('ice-candidate', candidate);
    });

  });
};

// Export getIO so router can use it
const getIO = () => {
  if (!io) throw new Error('Socket not initialized');
  return io;
};

module.exports = { initSocket, getIO };