require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({ origin: '*' }));
app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: { origin: '*' }
});

// Store io in app to use in controllers
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  // A doctor will join a room based on their doctorId
  socket.on('join-doctor-room', (doctorId) => {
    socket.join(doctorId);
    console.log(`Doctor ${doctorId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Import Routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patient');
const doctorRoutes = require('./routes/doctor');

app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'VaakCare API' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`\n🩺 Server running on http://localhost:${PORT}`);
});