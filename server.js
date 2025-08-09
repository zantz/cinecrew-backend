require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Make io accessible to routes via app locals
app.locals.io = io;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// DB
connectDB();

// Health check
app.get('/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/missions', require('./routes/missions'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/subscriptions', require('./routes/subscriptions'));

// Error handler
app.use(errorHandler);

// Socket.io
io.on('connection', (socket) => {
  console.log('🔌 Socket connected', socket.id);
  socket.on('disconnect', () => console.log('🔌 Socket disconnected', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server listening on :${PORT}`));
