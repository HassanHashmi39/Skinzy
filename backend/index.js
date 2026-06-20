const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware to attach io to req
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Setup socket connection
io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    
    socket.on('join', (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`👤 User joined room: ${userId}`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request Logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Routes
// Authentication
app.use('/api/auth', require('./routes/authRoutes'));

// Business Logic
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/medical-history', require('./routes/medicalHistoryRoutes'));
app.use('/api/routine', require('./routes/routineRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/analyses', require('./routes/analysisRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/feedbacks', require('./routes/feedbackRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Skinzy Backend is running 🚀',
        version: '1.0.3',
        time: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('🔥 Server Error:', err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 4445;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT} (accessible on LAN)`);
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
    } else {
        console.error('❌ Server Error:', e);
    }
});
