// ============================================
//  MindBloom Backend — server.js
//  Entry point. Starts Express + MongoDB.
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// ─── IMPORT ROUTES ────────────────────────
const authRoutes    = require('./routes/auth');
const moodRoutes    = require('./routes/mood');
const journalRoutes = require('./routes/journal');
const aiRoutes      = require('./routes/ai');
const insightRoutes = require('./routes/insights');
const userRoutes    = require('./routes/user');

// ─── SECURITY MIDDLEWARE ───────────────────
// helmet() adds security headers to every response
app.use(helmet());

// CORS: allow only your frontend to call this API
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting: max 100 requests per 15 minutes per IP
// Protects against brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use(limiter);

// Stricter limit for auth routes (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts. Try again in 15 minutes.' },
});

// ─── GENERAL MIDDLEWARE ────────────────────
app.use(express.json({ limit: '10kb' }));        // parse JSON body
app.use(express.urlencoded({ extended: true })); // parse URL-encoded body
app.use(morgan('dev'));                          // log requests in terminal

// ─── ROUTES ───────────────────────────────
app.use('/api/auth',     authLimiter, authRoutes);
app.use('/api/mood',     moodRoutes);
app.use('/api/journal',  journalRoutes);
app.use('/api/ai',       aiRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/user',     userRoutes);

// ─── SERVE FRONTEND IN PRODUCTION ─────────
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the frontend build folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Handle any routes that aren't API routes by serving index.html
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// ─── HEALTH CHECK ─────────────────────────
// Visit http://localhost:5000/health to check if server is running
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '🌸 MindBloom API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 HANDLER ──────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ─── GLOBAL ERROR HANDLER ─────────────────
// Any unhandled error in routes lands here
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ─── CONNECT TO MONGODB ───────────────────
const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    console.log('Current URI:', uri ? (uri.includes('@') ? uri.split('@')[1] : uri) : 'None');

    // Use memory server in development if no real URI is provided or if we want a quick start
    const isLocalhost = uri && (uri.includes('localhost') || uri.includes('127.0.0.1'));
    const isPlaceholder = !uri || uri.includes('YOUR_USERNAME') || uri.includes('<db_password>') || uri === '';
    
    if (process.env.NODE_ENV === 'development' && (isPlaceholder || isLocalhost)) {
      try {
        console.log('Attempting to start In-Memory MongoDB...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
        console.log('🍃 Using In-Memory MongoDB for development');
      } catch (err) {
        console.warn('⚠️ Could not start MongoMemoryServer, falling back to MONGODB_URI');
      }
    }

    try {
      await mongoose.connect(uri);
      console.log('✅ MongoDB connected');
    } catch (err) {
      console.error('❌ MongoDB connection failed:', err.message);
      
      // If Atlas fails, try falling back to In-Memory DB in development
      if (process.env.NODE_ENV === 'development' && !uri.includes('127.0.0.1')) {
        console.log('🔄 Falling back to In-Memory MongoDB...');
        try {
          const { MongoMemoryServer } = require('mongodb-memory-server');
          const mongod = await MongoMemoryServer.create();
          const fallbackUri = mongod.getUri();
          await mongoose.connect(fallbackUri);
          console.log('🍃 Using In-Memory MongoDB (Temporary fallback)');
        } catch (fallbackErr) {
          console.error('❌ Fallback MongoDB failed:', fallbackErr.message);
          process.exit(1);
        }
      } else {
        process.exit(1);
      }
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 MindBloom server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('❌ Unexpected error during startup:', err.message);
    process.exit(1);
  }
};

connectDB();

module.exports = app;
