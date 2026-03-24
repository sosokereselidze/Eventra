import { v4 as uuidv4 } from 'uuid';
import { getCollections } from '../db.js';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../auth.js';
import { toPublicUser } from '../utils/userUtils.js';
import { OAuth2Client } from 'google-auth-library';
import { APIError } from '../middleware/errorHandler.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new APIError('Token is required', 400);
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new APIError('Invalid Google token', 401);

    const { email, name, picture, sub: googleId } = payload;
    const { users } = getCollections();

    let user = await users.findOne({ email });

    if (!user) {
      const newUser = {
        id: uuidv4(),
        email,
        username: email.split('@')[0] + Math.floor(Math.random() * 1000),
        name: name || 'Google User',
        passwordHash: null,
        isAdmin: false,
        googleId,
        avatar: picture,
        created_at: new Date().toISOString(),
      };
      await users.insertOne(newUser);
      user = newUser;
    } else if (!user.googleId) {
      await users.updateOne({ id: user.id }, { $set: { googleId, avatar: picture } });
      user.googleId = googleId;
    }

    const jwtToken = signToken({ userId: user.id, isAdmin: user.isAdmin });

    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ token: jwtToken, user: toPublicUser(user) });
  } catch (error) {
    next(error);
  }
};

export const signup = async (req, res, next) => {
  try {
    const { users } = getCollections();
    const { email, username, password, name } = req.body || {};
    if (!email || !username || !password || !name) {
      throw new APIError('Email, username, password, and name are required', 400);
    }

    // Basic password strength check
    if (password.length < 8) {
      throw new APIError('Password must be at least 8 characters long', 400);
    }
    if (!/[A-Z]/.test(password)) {
      throw new APIError('Password must contain at least one uppercase letter', 400);
    }
    if (!/[a-z]/.test(password)) {
      throw new APIError('Password must contain at least one lowercase letter', 400);
    }
    if (!/[0-9]/.test(password)) {
      throw new APIError('Password must contain at least one number', 400);
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      throw new APIError('Password must contain at least one special character', 400);
    }

    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    const existing = await users.findOne({
      $or: [
        { email: trimmedEmail },
        { username: trimmedUsername }
      ]
    }, { collation: { locale: 'en', strength: 2 } }); // Use collation for case-insensitive comparison

    if (existing) {
      const field = existing.email.toLowerCase() === trimmedEmail.toLowerCase() ? 'Email' : 'Username';
      throw new APIError(`${field} already registered`, 400);
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

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: toPublicUser(user), token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { users } = getCollections();
    const { identifier, password } = req.body || {};
    if (!identifier || !password) {
      throw new APIError('Email/Username and password are required', 400);
    }

    const identifierLower = identifier.trim().toLowerCase();
    const user = await users.findOne({
      $or: [
        { email: identifierLower },
        { username: identifierLower }
      ]
    }, { collation: { locale: 'en', strength: 2 } });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new APIError('Invalid credentials', 401);
    }
    const token = signToken({ userId: user.id, email: user.email });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: toPublicUser(user), token });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    // req.user is already populated by requireAuth middleware
    res.json({ user: toPublicUser(req.user) });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

export const verifyAdmin = (req, res) => {
  if (!req.user.isAdmin) {
    throw new APIError('Not authorized', 403);
  }
  res.json({ ok: true });
};
