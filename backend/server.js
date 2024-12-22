require('dotenv').config();  // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth'); // Authentication routes
const shipmentRoutes = require('./routes/ship'); // Shipment routes
const userRoutes = require('./routes/userRoutes'); // User routes
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const app = express();
const server = http.createServer(app); // Use the same server for both Express and Socket.io
const io = socketIo(server); // Attach socket.io to the server

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json()); // This is already included in the updated app

// MongoDB connection using environment variable or local connection string
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bfn', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});

// Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/shipments', shipmentRoutes); // Shipment routes
app.use('/api/users', userRoutes); // User routes
app.use('/api', productRoutes);
app.use('/api/categories', categoryRoutes);


// WebSocket users object to track admin and user connections
let users = {}; // Track users by socket ID
let activeChats = {}; // Track active chats (userId -> socketId)

// WebSocket connection handler
io.on('connection', (socket) => {
    console.log('A user connected: ', socket.id);

    // When a user sends a message (either support or general)
    socket.on('sendMessage', (data) => {
        if (data.isSupportRequest) {
            // Notify admin of support request
            io.emit('newSupportRequest', { userId: socket.id, message: data.message });
        } else {
            // Send the message to the admin if they are listening
            if (users[data.adminId]) {
                io.to(users[data.adminId]).emit('messageFromUser', { userId: socket.id, message: data.message });
            }
        }
    });

    // When admin connects
    socket.on('adminConnect', (adminId) => {
        users[adminId] = socket.id;
        console.log(`Admin ${adminId} connected`);
    });

    // When a user starts a chat
    socket.on('joinChat', (data) => {
        activeChats[socket.id] = { userId: data.userId, socketId: socket.id };
        console.log(`User ${data.userId} started a chat`);
    });

    // When a user sends a message to another user (or admin)
    socket.on('sendMessageToUser', (data) => {
        // Send the message to the specific user (if they are online)
        const targetSocketId = activeChats[data.targetUserId]?.socketId;
        if (targetSocketId) {
            io.to(targetSocketId).emit('messageFromUser', {
                userId: data.senderId,
                message: data.message
            });
        }
    });

    // When a user disconnects
    socket.on('disconnect', () => {
        console.log('A user disconnected: ', socket.id);

        // Remove the user from active chats
        delete activeChats[socket.id];

        // Remove admin from the users list if the admin is disconnecting
        for (let adminId in users) {
            if (users[adminId] === socket.id) {
                delete users[adminId];
                break;
            }
        }
    });
});

// Start server and WebSocket
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
