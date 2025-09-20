const express = require('express');
require('dotenv').config();
const chalk = require('chalk');
const db = require('./db');
const cors = require('cors');
const path = require('path');

const socketIo = require('socket.io');
const { createServer } = require('http');

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());
const routes = require('./routes/index');
app.use('/api/', routes);

// Configure CORS properly
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173', // Your React app URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
});

// Store room data
const rooms = new Map();

// Server-side socket.io fixes

// io.on('connection', socket => {
//   const userId = socket.handshake.query.userId;
//   const roomId = socket.handshake.query.roomId;

//   console.log('User connected:', userId || socket.id);

//   // Join room automatically based on query parameters
//   if (roomId) {
//     socket.join(roomId);
//     console.log(`User ${userId} joined room ${roomId}`);

//     // Add user to room
//     if (!rooms.has(roomId)) {
//       rooms.set(roomId, new Set());
//     }
//     rooms.get(roomId).add(userId);

//     // Notify others in the room
//     socket.to(roomId).emit('user-connected', userId);
//   }

//   // WebRTC signaling - fixed parameter order
//   socket.on('offer', data => {
//     socket.to(data.roomId).emit('offer', {
//       offer: data.offer,
//       targetUserId: data.targetUserId,
//       senderId: userId,
//     });
//   });

//   socket.on('answer', data => {
//     socket.to(data.roomId).emit('answer', {
//       answer: data.answer,
//       targetUserId: data.targetUserId,
//       senderId: userId,
//     });
//   });

//   socket.on('ice-candidate', data => {
//     socket.to(data.roomId).emit('ice-candidate', {
//       candidate: data.candidate,
//       targetUserId: data.targetUserId,
//       senderId: userId,
//     });
//   });

//   // Chat messages - fixed parameter structure
//   socket.on('send-chat-message', (message, roomId, userId) => {
//     socket.to(roomId).emit('receive-chat-message', message, userId);
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log('User disconnected:', userId || socket.id);
//     // Remove user from all rooms
//     rooms.forEach((users, roomId) => {
//       if (users.has(userId || socket.id)) {
//         users.delete(userId || socket.id);
//         socket.to(roomId).emit('user-disconnected', userId || socket.id);
//         if (users.size === 0) {
//           rooms.delete(roomId);
//         }
//       }
//     });
//   });
// });

// io.on('connection', socket => {
//   const userId = socket.handshake.query.userId;
//   const roomId = socket.handshake.query.roomId;

//   console.log('User connected:', userId || socket.id);

//   // Join room automatically based on query parameters
//   if (roomId) {
//     socket.join(roomId);
//     console.log(`User ${userId} joined room ${roomId}`);

//     // Add user to room
//     if (!rooms.has(roomId)) {
//       rooms.set(roomId, new Set());
//     }
//     rooms.get(roomId).add(userId);

//     // Notify others in the room
//     socket.to(roomId).emit('user-connected', userId);
//   }

//   // WebRTC signaling - fixed parameter order
//   socket.on('offer', data => {
//     console.log('Offer received from:', userId, 'to:', data.targetUserId);
//     socket.to(data.roomId).emit('offer', {
//       offer: data.offer,
//       targetUserId: data.targetUserId,
//       senderId: userId,
//     });
//   });

//   socket.on('answer', data => {
//     console.log('Answer received from:', userId, 'to:', data.targetUserId);
//     socket.to(data.roomId).emit('answer', {
//       answer: data.answer,
//       targetUserId: data.targetUserId,
//       senderId: userId,
//     });
//   });

//   socket.on('ice-candidate', data => {
//     console.log('ICE candidate received from:', userId, 'to:', data.targetUserId);
//     socket.to(data.roomId).emit('ice-candidate', {
//       candidate: data.candidate,
//       targetUserId: data.targetUserId,
//       senderId: userId,
//     });
//   });

//   // Chat messages - FIXED to match client-side structure
//   socket.on('send-chat-message', data => {
//     console.log('Chat message from:', userId, 'in room:', data.roomId);
//     socket.to(data.roomId).emit('receive-chat-message', {
//       message: data.message,
//       senderId: userId,
//       roomId: data.roomId,
//       timestamp: new Date().toISOString()
//     });
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log('User disconnected:', userId || socket.id);
//     // Remove user from all rooms
//     rooms.forEach((users, roomId) => {
//       if (users.has(userId || socket.id)) {
//         users.delete(userId || socket.id);
//         socket.to(roomId).emit('user-disconnected', userId || socket.id);
//         if (users.size === 0) {
//           rooms.delete(roomId);
//         }
//       }
//     });
//   });
// });

// io.on('connection', socket => {
//   const userId = socket.handshake.query.userId;
//   const roomId = socket.handshake.query.roomId;

//   console.log('User connected:', userId || socket.id);

//   // Join room automatically based on query parameters
//   if (roomId) {
//     socket.join(roomId);
//     console.log(`User ${userId} joined room ${roomId}`);

//     // Add user to room
//     if (!rooms.has(roomId)) {
//       rooms.set(roomId, new Set());
//     }
//     rooms.get(roomId).add(userId);

//     // Notify others in the room
//     socket.to(roomId).emit('user-connected', userId);
//   }

//   // Add explicit join-room handler
//   socket.on('join-room', (roomId, userId) => {
//     socket.join(roomId);
//     console.log(`User ${userId} explicitly joined room ${roomId}`);

//     if (!rooms.has(roomId)) {
//       rooms.set(roomId, new Set());
//     }
//     rooms.get(roomId).add(userId);

//     socket.to(roomId).emit('user-connected', userId);
//   });

//   // WebRTC signaling - fixed parameter order
//   socket.on('offer', data => {
//     socket.to(data.roomId).emit('offer', {
//       offer: data.offer,
//       targetUserId: data.targetUserId,
//       senderId: userId,
//     });
//   });

//   socket.on('answer', data => {
//     socket.to(data.roomId).emit('answer', {
//       answer: data.answer,
//       senderId: socket.id,
//       targetUserId: data.targetUserId,
//     });
//   });

//   socket.on('ice-candidate', data => {
//     socket.to(data.roomId).emit('ice-candidate', {
//       candidate: data.candidate,
//       targetUserId: data.targetUserId,
//       senderId: userId,
//     });
//   });

//   // Chat messages - KEEP THE ORIGINAL STRUCTURE for compatibility
//   socket.on('send-chat-message', (message, roomId, userId) => {
//     socket.to(roomId).emit('receive-chat-message', message, userId);
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log('User disconnected:', userId || socket.id);
//     // Remove user from all rooms
//     rooms.forEach((users, roomId) => {
//       if (users.has(userId)) {
//         users.delete(userId);
//         socket.to(roomId).emit('user-disconnected', userId);
//         if (users.size === 0) {
//           rooms.delete(roomId);
//         }
//       }
//     });
//   });
// });

// Make sure you have this at the top of your file

// io.on('connection', socket => {
//   const userId = socket.handshake.query.userId;
//   const roomId = socket.handshake.query.roomId;

//   console.log('User connected - Socket ID:', socket.id, 'User ID:', userId);

//   // Join room automatically based on query parameters
//   if (roomId && userId) {
//     // Validate userId
//     if (!userId) {
//       console.error('Invalid userId received');
//       return;
//     }

//     socket.join(roomId);
//     console.log(`User ${userId} joined room ${roomId}`);

//     // Add user to room
//     if (!rooms.has(roomId)) {
//       rooms.set(roomId, new Set());
//     }
//     rooms.get(roomId).add(userId);

//     // Notify others in the room
//     socket.to(roomId).emit('user-connected', userId);
//   }

//   // Add explicit join-room handler
//   socket.on('join-room', data => {
//     const { roomId, userId } = data;
//     socket.join(roomId);
//     console.log(`User ${userId} explicitly joined room ${roomId}`);

//     if (!rooms.has(roomId)) {
//       rooms.set(roomId, new Set());
//     }
//     rooms.get(roomId).add(userId);

//     socket.to(roomId).emit('user-connected', userId);
//   });

//   // WebRTC signaling - FIXED parameter handling
//   socket.on('offer', data => {
//     console.log(
//       'Offer from user:',
//       userId,
//       'to target user:',
//       data.targetUserId,
//       'in room:',
//       data.roomId
//     );
//     socket.to(data.roomId).emit('offer', {
//       offer: data.offer,
//       targetUserId: data.targetUserId, // Preserve the original targetUserId
//       senderId: userId, // Use userId instead of socket.id
//     });
//   });
//   // In your server code - FIX the answer handler
//   socket.on('answer', data => {
//     console.log(
//       'Answer from user:',
//       userId,
//       'to target user:',
//       data.targetUserId,
//       'in room:',
//       data.roomId
//     );

//     // CRITICAL: Forward the targetUserId AS RECEIVED from the client
//     socket.to(data.roomId).emit('answer', {
//       answer: data.answer,
//       senderId: userId, // Use userId instead of socket.id
//       targetUserId: data.targetUserId, // PRESERVE the original targetUserId
//     });
//   });

//   socket.on('ice-candidate', data => {
//     console.log(
//       'ICE candidate from user:',
//       userId,
//       'to target user:',
//       data.targetUserId,
//       'in room:',
//       data.roomId
//     );
//     socket.to(data.roomId).emit('ice-candidate', {
//       candidate: data.candidate,
//       targetUserId: data.targetUserId, // Preserve the original targetUserId
//       senderId: userId, // Use userId instead of socket.id
//     });
//   });

//   // Chat messages
//   socket.on('send-chat-message', (message, roomId, userId) => {
//     socket.to(roomId).emit('receive-chat-message', message, userId);
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log(
//       'User disconnected - Socket ID:',
//       socket.id,
//       'User ID:',
//       userId
//     );
//     // Remove user from all rooms
//     rooms.forEach((users, roomId) => {
//       if (users.has(userId)) {
//         users.delete(userId);
//         socket.to(roomId).emit('user-disconnected', userId);
//         console.log(`User ${userId} removed from room ${roomId}`);
//         if (users.size === 0) {
//           rooms.delete(roomId);
//           console.log(`Room ${roomId} deleted (no users left)`);
//         }
//       }
//     });
//   });
// });

// In your server code - add a check to prevent double joining
// Track joined users

// Store for tracking rooms and users


const userSocketMap = new Map(); // userId -> socketId

io.on('connection', socket => {
  const userId = socket.handshake.query.userId; // Get userId from query params
  const roomId = socket.handshake.query.roomId;

  console.log('Connection details:', {
    socketId: socket.id,
    userId: userId,
    roomId: roomId,
    query: socket.handshake.query
  });

  console.log('User connected - Socket ID:', socket.id, 'User ID:', userId);

  // Store the user ID in the socket object for later use
  socket.userId = userId;

  // Check if user already has a connection and disconnect it
  if (userId && userSocketMap.has(userId)) {
    const oldSocketId = userSocketMap.get(userId);
    console.log(`User ${userId} already connected with socket ${oldSocketId}, disconnecting old connection`);
    
    // Disconnect the old socket
    const oldSocket = io.sockets.sockets.get(oldSocketId);
    if (oldSocket) {
      oldSocket.disconnect(true);
      console.log(`Disconnected old socket ${oldSocketId}`);
    }
  }

  // Store the new socket connection
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
          console.log(`Room ${room} is now empty and has been removed`);
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
    console.log(`Notified room ${roomId} about user ${userId} connection`);

    // Send success response to client
    socket.emit('join-room-success', { roomId, userId });
  }

  // Explicit join-room handler as backup
  socket.on('join-room', data => {
    const { roomId, userId } = data;

    if (!roomId || !userId) {
      console.error('Missing roomId or userId in join-room:', data);
      socket.emit('join-room-error', { message: 'Missing roomId or userId' });
      return;
    }

    // Remove user from any previous rooms
    rooms.forEach((users, room) => {
      if (users.has(userId)) {
        users.delete(userId);
        socket.leave(room);
        console.log(`Removed user ${userId} from room ${room}`);
        
        // Notify room about user leaving
        socket.to(room).emit('user-disconnected', userId);
        
        if (users.size === 0) {
          rooms.delete(room);
          console.log(`Room ${room} is now empty and has been removed`);
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

    // Notify others in the room about the new user
    socket.to(roomId).emit('user-connected', userId);
    console.log(`Notified room ${roomId} about user ${userId} connection`);

    // Send success response to client
    socket.emit('join-room-success', { roomId, userId });
  });

  // WebRTC signaling handlers
  socket.on('offer', data => {
    console.log(
      'Offer from user:',
      socket.userId,
      'to:',
      data.targetUserId,
      'room:',
      data.roomId
    );

    // Send offer to the specific target user
    socket.to(data.roomId).emit('offer', {
      offer: data.offer,
      targetUserId: data.targetUserId,
      senderId: socket.userId,
      roomId: data.roomId,
    });
  });

  socket.on('answer', data => {
    console.log(
      'Answer from user:',
      socket.userId,
      'to:',
      data.targetUserId,
      'room:',
      data.roomId
    );

    // Send answer to the specific target user
    socket.to(data.roomId).emit('answer', {
      answer: data.answer,
      senderId: socket.userId,
      targetUserId: data.targetUserId,
      roomId: data.roomId,
    });
  });

  socket.on('ice-candidate', data => {
    console.log(
      'ICE candidate from:',
      socket.userId,
      'to:',
      data.targetUserId,
      'room:',
      data.roomId
    );

    // Send ICE candidate to the specific target user
    socket.to(data.roomId).emit('ice-candidate', {
      candidate: data.candidate,
      targetUserId: data.targetUserId,
      senderId: socket.userId,
      roomId: data.roomId,
    });
  });

  // Chat messages
  socket.on('send-chat-message', data => {
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
  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', userId || socket.id, 'Reason:', reason);

    // Remove user from socket map
    if (userId && userSocketMap.get(userId) === socket.id) {
      userSocketMap.delete(userId);
      console.log(`Removed user ${userId} from socket map`);
    }

    // Remove user from all rooms
    rooms.forEach((users, roomId) => {
      if (users.has(userId)) {
        users.delete(userId);
        socket.to(roomId).emit('user-disconnected', userId);
        console.log(`User ${userId} disconnected from room ${roomId}`);

        // Clean up empty rooms
        if (users.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} is now empty and has been removed`);
        }
      }
    });
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error for user', userId, ':', error);
  });
});

app.set('io', io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(chalk.green.bold(`🚀 Server is running on port ${PORT}...`));
});
