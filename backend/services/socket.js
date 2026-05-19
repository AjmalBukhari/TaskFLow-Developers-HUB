let io;
const { Server } = require('socket.io');
const config = require('../config/config');

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: { origin: config.corsOrigin, methods: ["GET", "POST"] }
    });
    return io;
  },
  getIO: () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
  }
};
