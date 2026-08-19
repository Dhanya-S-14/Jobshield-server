const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const routes = require('./routes/index');

dotenv.config();

const app = express();

// Basic XSS protection (replaces deprecated xss-clean)
const xssClean = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  next();
};

// Connect to DB (non-blocking — server starts even if DB is down)
connectDB().then((connected) => {
  if (!connected) {
    console.log('Starting server in limited mode (no database)');
  }
});

const server = http.createServer(app);

// Socket.io (optional)
try {
  const { Server } = require('socket.io');
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  app.set('io', io);

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
    });

    socket.on('chat_message', (data) => {
      socket.to(data.room).emit('chat_message', data);
    });

    socket.on('typing', (data) => {
      socket.to(data.room).emit('typing', data);
    });

    socket.on('warning_alert', (warning) => {
      io.emit('new_warning', warning);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
} catch (err) {
  console.warn('Socket.io not available:', err.message);
}

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xssClean);

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'JobShield API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors).map(e => e.message).join('. ')
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value'
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🛡️  JobShield API running on http://0.0.0.0:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API base: http://localhost:${PORT}/api\n`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled rejection: ${err.message}`);
});

process.on('uncaughtException', (err) => {
  console.error(`Uncaught exception: ${err.message}`);
});

module.exports = app;
