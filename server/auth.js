import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getCollections } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '7d';

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: JWT_SECRET environment variable is not set in production!');
}

const secret = JWT_SECRET || 'eventflow-dev-secret-change-in-production';

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

export async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { users } = getCollections();
    const user = await users.findOne({ id: decoded.userId });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return next();
    }
    const decoded = verifyToken(token);
    if (!decoded) return next();

    const { users } = getCollections();
    const user = await users.findOne({ id: decoded.userId });

    if (user) req.user = user;
    next();
  } catch (error) {
    next();
  }
}
