import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization;
    let token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const auth = req.headers.authorization;
    let token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) return next();

    const user = await User.findById(decoded.id).select('-password');

    if (user) req.user = user;
    next();
  } catch (error) {
    next();
  }
}

export const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.isAdmin)) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};

export const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Super Admin access required' });
  }
};
