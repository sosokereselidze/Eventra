import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { connectDB, getCollections } from './db.js';
import { initializeDatabase } from './store.js';
import { hashPassword, verifyPassword, signToken, requireAuth, verifyToken } from './auth.js';
import { OAuth2Client } from 'google-auth-library';

const app = express();
const PORT = process.env.PORT || 3001;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// CORS configuration for both development and production
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
  /https:\/\/.*\.vercel\.app$/, // Allow all Vercel preview deployments
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list or matches regex
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

// Middleware to ensure DB connection and initialization
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

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'public/uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
  }
});

function toPublicUser(u) {
  if (!u) return null;
  return { id: u.id, email: u.email, username: u.username, name: u.name, isAdmin: !!u.isAdmin };
}

// Health check with DB verification
app.get('/api/health', async (req, res) => {
  try {
    const { events } = getCollections();
    const count = await events.countDocuments();
    res.json({ status: 'ok', database: 'connected', events_count: count, env: process.env.NODE_ENV });
  } catch (err) {
    res.json({ status: 'partial', database: 'error', error: err.message });
  }
});
app.get('/health', (req, res) => res.json({ status: 'ok', origin: 'root' }));

// Auth patterns...
app.post(['/api/auth/google', '/auth/google'], async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ error: 'Invalid Google token' });

    const { email, name, picture, sub: googleId } = payload;
    const { users } = getCollections();

    let user = await users.findOne({ email });

    if (!user) {
      // Create new user
      const newUser = {
        id: uuidv4(),
        email,
        username: email.split('@')[0] + Math.floor(Math.random() * 1000), // Generate unique username
        name: name || 'Google User',
        passwordHash: null, // No password for Google users
        isAdmin: false,
        googleId,
        avatar: picture,
        created_at: new Date().toISOString(),
      };
      await users.insertOne(newUser);
      user = newUser;
    } else {
      // Update googleId if missing (linking account)
      if (!user.googleId) {
        await users.updateOne({ id: user.id }, { $set: { googleId, avatar: picture } });
        user.googleId = googleId;
      }
    }

    const jwtToken = signToken({ userId: user.id, isAdmin: user.isAdmin });
    res.json({ token: jwtToken, user: toPublicUser(user) });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

app.post(['/api/auth/signup', '/auth/signup'], async (req, res) => {
  try {
    const { users } = getCollections();
    const { email, username, password, name } = req.body || {};
    if (!email || !username || !password || !name) {
      return res.status(400).json({ error: 'Email, username, password, and name are required' });
    }

    // Check if email or username already exists
    const existing = await users.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${email}$`, 'i') } },
        { username: { $regex: new RegExp(`^${username}$`, 'i') } }
      ]
    });

    if (existing) {
      const field = existing.email.toLowerCase() === email.toLowerCase() ? 'Email' : 'Username';
      return res.status(400).json({ error: `${field} already registered` });
    }

    const id = uuidv4();
    const user = {
      id,
      email: email.trim(),
      username: username.trim(),
      passwordHash: hashPassword(password),
      name: (name || '').trim(),
      isAdmin: false,
      created_at: new Date().toISOString(),
    };
    await users.insertOne(user);
    const token = signToken({ userId: id, email: user.email });
    return res.json({ user: toPublicUser(user), token });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post(['/api/auth/login', '/auth/login'], async (req, res) => {
  try {
    const { users } = getCollections();
    const { identifier, password } = req.body || {}; // 'identifier' can be email or username
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Username and password are required' });
    }

    // Find user by email OR username
    const user = await users.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${identifier}$`, 'i') } },
        { username: { $regex: new RegExp(`^${identifier}$`, 'i') } }
      ]
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signToken({ userId: user.id, email: user.email });
    return res.json({ user: toPublicUser(user), token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get(['/api/auth/me', '/auth/me'], async (req, res) => {
  try {
    const { users } = getCollections();
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    const user = await users.findOne({ id: decoded.userId });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    return res.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error('Auth me error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/verify-admin', requireAuth, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  return res.json({ ok: true });
});

app.get(['/api/events', '/events'], async (req, res) => {
  try {
    const { events } = getCollections();
    const limit = Math.min(parseInt(req.query.limit) || 18, 100);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const totalCount = await events.countDocuments();
    const items = await events.find({})
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return res.json({
      events: items,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Get events error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get(['/api/events/featured', '/events/featured'], async (_req, res) => {
  try {
    const { events } = getCollections();
    const list = await events.find({ featured: true }).sort({ date: 1 }).limit(5).toArray();
    return res.json(list);
  } catch (error) {
    console.error('Get featured events error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get(['/api/events/:id', '/events/:id'], async (req, res) => {
  try {
    const { events } = getCollections();
    const event = await events.findOne({ id: req.params.id });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    return res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin-only (or just authenticated as requested) event management
app.post('/api/events', requireAuth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Not authorized' });
    const { events } = getCollections();
    const eventData = req.body;

    if (!eventData.title || !eventData.date || !eventData.location) {
      return res.status(400).json({ error: 'Title, date, and location are required' });
    }

    const id = uuidv4();
    const newEvent = {
      ...eventData,
      id,
      tickets_booked: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await events.insertOne(newEvent);
    return res.json(newEvent);
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/events/:id', requireAuth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Not authorized' });
    const { events } = getCollections();
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date().toISOString() };

    // Remove protected fields from the update body just in case
    delete updateData._id;
    delete updateData.id;

    const result = await events.findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) return res.status(404).json({ error: 'Event not found' });
    return res.json(result);
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/events/:id', requireAuth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Not authorized' });
    const { events } = getCollections();
    const { id } = req.params;

    const result = await events.deleteOne({ id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Event not found' });

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const SUPER_ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

app.delete('/api/admin/users/:id', requireAuth, async (req, res) => {
  try {
    if (req.user.username !== SUPER_ADMIN_USERNAME) {
      return res.status(403).json({ error: 'Only the Super Admin can delete users' });
    }
    const { users, bookings } = getCollections();
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }

    const result = await users.deleteOne({ id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'User not found' });

    // Cleanup bookings for this user
    await bookings.deleteMany({ user_id: id });

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/analytics', requireAuth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Not authorized' });
    const { users, events, bookings } = getCollections();

    const [allUsers, allEvents, allBookings] = await Promise.all([
      users.find({}).toArray(),
      events.find({}).toArray(),
      bookings.find({}).toArray()
    ]);

    const totalUsers = allUsers.length;
    const totalEvents = allEvents.length;
    const totalBookings = allBookings.length;

    // Create a map of events for quick price lookup
    const eventMap = new Map();
    allEvents.forEach(e => eventMap.set(e.id, e));

    // Calculate detailed revenue
    let totalRevenue = 0;
    const monthlyRevenue = {}; // Format: "Jan", "Feb", etc.
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    allBookings.forEach(b => {
      const event = eventMap.get(b.event_id);
      if (event) {
        // Ensure numbers
        const price = Number(event.price) || 0;
        const qty = Number(b.quantity) || 1;
        const amount = price * qty;
        totalRevenue += amount;

        // Monthly bucket
        const date = new Date(b.created_at);
        // Only for current year, or maybe just last 12 months. Let's do all time aggregated by month for simplicity or just 2024/2025.
        // Let's just group by month name for the chart.
        const monthName = monthNames[date.getMonth()];
        monthlyRevenue[monthName] = (monthlyRevenue[monthName] || 0) + amount;
      }
    });

    // Format revenue data for Recharts
    const revenueOverTime = monthNames.map(name => ({
      name,
      total: monthlyRevenue[name] || 0
    }));

    // Get event distribution
    const categoryStatsArray = allEvents.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {});
    const categoryStats = Object.entries(categoryStatsArray).map(([name, value]) => ({ name, value }));

    // Recent activity with populated event names
    const recentActivity = allBookings
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10)
      .map(b => {
        const ev = eventMap.get(b.event_id);
        return { ...b, event_title: ev ? ev.title : 'Unknown Event' };
      });

    return res.json({
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue,
      revenueOverTime,
      categoryStats,
      recentActivity
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/users', requireAuth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Not authorized' });
    const { users } = getCollections();
    
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const totalCount = await users.countDocuments();
    const items = await users.find({})
      .project({ passwordHash: 0 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return res.json({
      users: items.map(u => ({ ...u, id: u.id || u._id.toString() })),
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/bookings', requireAuth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Not authorized' });
    const { bookings, events, users } = getCollections();

    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const totalCount = await bookings.countDocuments();
    const items = await bookings.find({})
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Populate details
    const enriched = await Promise.all(items.map(async (b) => {
      const user = await users.findOne({ id: b.user_id }, { projection: { passwordHash: 0 } });
      const event = await events.findOne({ id: b.event_id });
      return {
        ...b,
        user: user ? { name: user.name, email: user.email } : { name: 'Unknown', email: 'N/A' },
        event: event ? { title: event.title, price: event.price } : { title: 'Unknown', price: 0 }
      };
    }));

    return res.json({
      bookings: enriched.map(b => ({ ...b, id: b.id || b._id.toString() })),
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Get admin bookings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/users/:id/role', requireAuth, async (req, res) => {
  try {
    if (req.user.username !== SUPER_ADMIN_USERNAME) {
      return res.status(403).json({ error: 'Only the Super Admin can change roles' });
    }

    const { id } = req.params;
    const { isAdmin } = req.body;

    const { users } = getCollections();
    const result = await users.updateOne(
      { id },
      { $set: { isAdmin: !!isAdmin } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bookings', requireAuth, async (req, res) => {
  try {
    const { bookings, events } = getCollections();
    const userBookings = await bookings.find({ user_id: req.user.id }).toArray();

    // Attach event details to each booking
    const list = await Promise.all(
      userBookings.map(async (b) => {
        const ev = await events.findOne({ id: b.event_id });
        return { ...b, events: ev || null };
      })
    );

    // Sort by created_at descending
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return res.json(list);
  } catch (error) {
    console.error('Get bookings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/bookings', requireAuth, async (req, res) => {
  try {
    const { bookings, events } = getCollections();
    const { eventId, quantity = 1 } = req.body || {};
    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }
    const event = await events.findOne({ id: eventId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const q = Math.max(1, Math.floor(Number(quantity) || 1));
    const available = event.tickets_available - event.tickets_booked;
    if (available < q) {
      return res.status(400).json({ error: 'Not enough tickets available' });
    }
    const id = uuidv4();
    const booking = {
      id,
      user_id: req.user.id,
      event_id: eventId,
      quantity: q,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };
    await bookings.insertOne(booking);

    // Update event tickets_booked count
    await events.updateOne(
      { id: eventId },
      { $inc: { tickets_booked: q } }
    );

    return res.json({ success: true, booking_id: id });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/bookings/:id', requireAuth, async (req, res) => {
  try {
    const { bookings, events } = getCollections();
    const booking = await bookings.findOne({ id: req.params.id });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    // Update event tickets_booked count
    await events.updateOne(
      { id: booking.event_id },
      { $inc: { tickets_booked: -booking.quantity } }
    );

    await bookings.deleteOne({ id: req.params.id });
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete booking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/upload', requireAuth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Not authorized' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Return the public URL
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

