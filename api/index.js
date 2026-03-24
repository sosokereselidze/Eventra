import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { connectDB, getCollections } from './db.js';
import { initializeDatabase } from './store.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Security Middleware (Phase 1)
app.use(helmet()); // Security headers
app.use(mongoSanitize()); // Prevent NoSQL injection

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, 
  message: { error: 'Too many login/signup attempts, please try again later.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// 2. Standard Middleware
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
  /https:\/\/.*\.vercel\.app$/,
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    });
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// 3. Database Initialization Middleware
let dbInitialized = false;
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!dbInitialized) {
      await initializeDatabase();
      dbInitialized = true;
      console.log('✓ Database initialized');
    }
    next();
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.use('/uploads', express.static('public/uploads'));

// 4. Health Check
app.get('/api/health', async (req, res) => {
  try {
    const { events } = getCollections();
    const count = await events.countDocuments();
    res.json({ 
      status: 'ok', 
      database: 'connected', 
      events_count: count, 
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

// 5. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Legacy/Root redirects if needed
app.get('/health', (req, res) => res.json({ status: 'ok', origin: 'root' }));

// 6. 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// 7. Global Error Handler (Phase 1)
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Eventflow API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'production' && process.env.RUN_SERVER !== 'false') {
  startServer();
}

export default app;
