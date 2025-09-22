const express = require('express');
require('dotenv').config();
const chalk = require('chalk');
const db = require('./db');
const cors = require('cors');
const socketIo = require('socket.io');
const { createServer } = require('http');

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());
const routes = require('./routes/index');
app.use('/api/', routes);

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
});
// Store room data
const rooms = new Map();
const userSocketMap = new Map();

io.on('connection', socket => {
  const userId = socket.handshake.query.userId;
  const roomId = socket.handshake.query.roomId;
  // Store the user ID in the socket object for later use
  socket.userId = userId;
  // Check if user already has a connection and disconnect it
  if (userId && userSocketMap.has(userId)) {
    const oldSocketId = userSocketMap.get(userId);
    // Disconnect the old socket
    const oldSocket = io.sockets.sockets.get(oldSocketId);
    if (oldSocket) {
      oldSocket.disconnect(true);
    }
  }
  if (userId) {
    userSocketMap.set(userId, socket.id);
    console.log(`Stored user ${userId} with socket ${socket.id}`);
  }

  // Automatic room joining with userId from query params
  if (roomId && userId) {
    // Remove user from any previous rooms
    rooms.forEach((users, room) => {
      if (users.has(userId)) {
        users.delete(userId);
        socket.leave(room);
        console.log(`Removed user ${userId} from room ${room}`);
        if (users.size === 0) {
          rooms.delete(room);
        }
      }
    });

    // Join the new room
    socket.join(roomId);
    console.log(`User ${userId} automatically joined room ${roomId}`);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(userId);
    // Notify others in the room about the new user
    socket.to(roomId).emit('user-connected', userId);
    // Send success response to client
    socket.emit('join-room-success', { roomId, userId });
  }

  // Explicit join-room handler as backup
  socket.on('join-room', data => {
    const { roomId, userId } = data;
    if (!roomId || !userId) {
      socket.emit('join-room-error', { message: 'Missing roomId or userId' });
      return;
    }
    // Remove user from any previous rooms
    rooms.forEach((users, room) => {
      if (users.has(userId)) {
        users.delete(userId);
        socket.leave(room);
        // Notify room about user leaving
        socket.to(room).emit('user-disconnected', userId);
        if (users.size === 0) {
          rooms.delete(room);
        }
      }
    });
    // Join the new room
    socket.join(roomId);
    console.log(`User ${userId} explicitly joined room ${roomId}`);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(userId);
    socket.to(roomId).emit('user-connected', userId);
    console.log(`Notified room ${roomId} about user ${userId} connection`);
    // Send success response to client
    socket.emit('join-room-success', { roomId, userId });
  });

  // WebRTC signaling handlers
  socket.on('offer', data => {
    // Send offer to the specific target user
    socket.to(data.roomId).emit('offer', {
      offer: data.offer,
      targetUserId: data.targetUserId,
      senderId: socket.userId,
      roomId: data.roomId,
    });
  });

  socket.on('answer', data => {
    socket.to(data.roomId).emit('answer', {
      answer: data.answer,
      senderId: socket.userId,
      targetUserId: data.targetUserId,
      roomId: data.roomId,
    });
  });

  socket.on('ice-candidate', data => {
    socket.to(data.roomId).emit('ice-candidate', {
      candidate: data.candidate,
      targetUserId: data.targetUserId,
      senderId: socket.userId,
      roomId: data.roomId,
    });
  });

  // Chat messages
  socket.on('chat-message', data => {
    console.log('Chat message from:', data.userId, 'in room:', data.roomId);
    // Forward to all other users in the room
    socket.to(data.roomId).emit('receive-chat-message', {
      message: data.message,
      senderId: data.userId,
      username: data.username,
      roomId: data.roomId,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle disconnection
  socket.on('disconnect', reason => {
    console.log('User disconnected:', userId || socket.id, 'Reason:', reason);
    if (userId && userSocketMap.get(userId) === socket.id) {
      userSocketMap.delete(userId);
      console.log(`Removed user ${userId} from socket map`);
    }
    rooms.forEach((users, roomId) => {
      if (users.has(userId)) {
        users.delete(userId);
        socket.to(roomId).emit('user-disconnected', userId);
        if (users.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
  // Handle connection errors
  socket.on('error', error => {
    console.error('Socket error for user', userId, ':', error);
  });
});

app.set('io', io);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(chalk.green.bold(`🚀 Server is running on port ${PORT}...`));
});
