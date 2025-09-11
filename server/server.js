const express = require('express');
require('dotenv').config();
const chalk = require('chalk');
const db = require('./db');
const cors = require('cors');

const { Server } = require('socket.io');
const { createServer } = require('http');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTED_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
const routes = require('./routes/index');
const { timeStamp } = require('console');
app.use('/api/', routes);

io.on('connection', socket => {
  console.log(`user connected : ${socket.id}`);

  socket.on('join-room', roomId => {
    socket.join(roomId);
    console.log(`user ${socket.id} joined room ${socket.roomId}`);
  });
  socket.on('leave-room', roomId => {
    socket.leave(roomId);
    console.log(`user ${socket.io} left from room ${roomId}`);
  });
  //handle signal for video calls
  socket.on('signal', data => {
    socket.to(data.roomId).emit('signal', {
      signal: data.signal,
      from: socket.id,
    });
  });
  //handle chat message
  socket.io('send-message', data => {
    socket.to(data.roomId).emit('receive-message', {
      message: data.message,
      username: data.username,
      timeStamp: new Date(),
    });
  });
  //handle member removal notification
  socket.on('member-removed', data => {
    socket.to(data.roomId).emit('member-removed', {
      memberId: data.memberId,
      removedBy: data.removedBy,
    });
  });
  socket.on('disconnect', () => {
    console.log(`User Disconnected`, socket.id);
  });
});

app.set('io', io);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(chalk.green.bold(`🚀 Server is running on port ${PORT}...`));
});
