import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/google', [
  body('token').notEmpty().withMessage('Token is required'),
  validate
], authController.googleAuth);

router.post('/signup', [
  body('email').isEmail().withMessage('Invalid email format'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  validate
], authController.signup);

router.post('/login', [
  body('identifier').notEmpty().withMessage('Email or Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
], authController.login);
router.get('/me', requireAuth, authController.getMe);
router.post('/logout', authController.logout);
router.get('/verify-admin', requireAuth, authController.verifyAdmin);

export default router;
