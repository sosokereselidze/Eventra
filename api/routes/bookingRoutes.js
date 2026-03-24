import express from 'express';
import { body, param } from 'express-validator';
import * as bookingController from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, bookingController.getBookings);
router.post('/', [
  requireAuth,
  body('eventId').notEmpty().withMessage('eventId is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate
], bookingController.createBooking);

router.delete('/:id', [
  requireAuth,
  param('id').notEmpty().withMessage('Booking ID is required'),
  validate
], bookingController.cancelBooking);

export default router;
