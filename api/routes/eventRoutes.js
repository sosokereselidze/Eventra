import express from 'express';
import { body, param, query } from 'express-validator';
import * as eventController from '../controllers/eventController.js';
import { requireAuth, adminOnly } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/', [
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('category').optional().trim(),
  query('search').optional().trim(),
  validate
], eventController.getEvents);
router.get('/featured', eventController.getFeaturedEvents);
router.get('/:id', eventController.getEventById);
router.post('/:id/favorite', requireAuth, eventController.toggleFavorite);

// Admin-only routes
router.post('/', [
  requireAuth,
  adminOnly,
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('location').notEmpty().withMessage('Location is required').trim(),
  body('category').notEmpty().withMessage('Category is required').trim(),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('tickets_available').isInt({ min: 1 }).withMessage('Tickets available must be at least 1'),
  validate
], eventController.createEvent);

router.put('/:id', [
  requireAuth,
  adminOnly,
  param('id').notEmpty().withMessage('Event ID is required'),
  body('title').optional().trim(),
  body('date').optional().isISO8601(),
  body('price').optional().isNumeric(),
  validate
], eventController.updateEvent);

router.delete('/:id', [
  requireAuth,
  adminOnly,
  param('id').notEmpty().withMessage('Event ID is required'),
  validate
], eventController.deleteEvent);

export default router;
