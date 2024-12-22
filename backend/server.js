require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const shipmentRoutes = require('./routes/ship');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Adjust this to only include trusted domains
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bfn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api', productRoutes);
app.use('/api/categories', categoryRoutes);

// WebSocket
let users = {}; // Track users by socket ID
let activeChats = {}; // Track active chats (userId -> socketId)

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on('sendMessage', (data) => {
    if (data.isSupportRequest) {
      io.emit('newSupportRequest', { userId: socket.id, message: data.message });
    } else {
      const adminSocketId = users[data.adminId];
      if (adminSocketId) {
        io.to(adminSocketId).emit('messageFromUser', { userId: socket.id, message: data.message });
      }
    }
  });

  socket.on('adminConnect', (adminId) => {
    users[adminId] = socket.id;
    console.log(`Admin ${adminId} connected with socket ID ${socket.id}`);
  });

  socket.on('joinChat', (data) => {
    activeChats[socket.id] = { userId: data.userId, socketId: socket.id };
    console.log(`User ${data.userId} joined a chat`);
  });

  socket.on('sendMessageToUser', (data) => {
    const targetSocketId = activeChats[data.targetUserId]?.socketId;
    if (targetSocketId) {
      io.to(targetSocketId).emit('messageFromUser', {
        userId: data.senderId,
        message: data.message,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`A user disconnected: ${socket.id}`);
    delete activeChats[socket.id];

    for (const adminId in users) {
      if (users[adminId] === socket.id) {
        delete users[adminId];
        break;
      }
    }
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('SIGINT signal received. Closing server and database connection.');
  await mongoose.connection.close();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Closing server and database connection.');
  await mongoose.connection.close();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
