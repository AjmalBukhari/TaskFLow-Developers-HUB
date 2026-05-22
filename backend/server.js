require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { init: initSocket } = require('./services/socket');
const errorHandler = require('./utils/errorHandler');
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const uploadRoutes = require('./routes/uploads');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = initSocket(server);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('Database connection error:', err));

module.exports = { app, io };
