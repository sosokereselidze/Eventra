import { v4 as uuidv4 } from 'uuid';
import { Booking } from '../models/Booking.js';
import { Event } from '../models/Event.js';
import mongoose from 'mongoose';

export const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user_id: req.user.id })
      .populate('event_id')
      .sort({ created_at: -1 });
    
    // Map for frontend compatibility
    const formatted = bookings.map(b => ({
      ...b.toJSON(),
      events: b.event_id
    }));
    
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { eventId, quantity = 1 } = req.body;

    const event = await Event.findById(eventId).session(session);
    if (!event) throw new Error('Event not found');

    if (event.tickets_available < quantity) {
      throw new Error('Not enough tickets available');
    }

    // Update tickets
    event.tickets_available -= quantity;
    event.tickets_booked += Number(quantity);
    await event.save({ session });

    const booking = await Booking.create([{
      user_id: req.user.id,
      event_id: eventId,
      quantity
    }], { session });

    await session.commitTransaction();
    res.status(201).json({ success: true, booking_id: booking[0]._id });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, error: error.message });
  } finally {
    session.endSession();
  }
};

export const getBookingTicket = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user_id: req.user.id })
      .populate('event_id');
    
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const event = booking.event_id;
    const ticketData = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART:${new Date(event.date).toISOString().replace(/-|:|\.\d+/g, '')}
LOCATION:${event.location}
DESCRIPTION:Booking ID: ${booking._id}\\nTickets: ${booking.quantity}
END:VEVENT
END:VCALENDAR`;

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking._id}.ics`);
    res.send(ticketData.trim());
  } catch (error) {
    next(error);
  }
};

export const getEventTicketStub = async (req, res, next) => {
  try {
    const { title, date, location } = req.query;
    if (!title || !date) return res.status(400).json({ error: 'Title and date are required' });

    const ticketData = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${new Date(date).toISOString().replace(/-|:|\.\d+/g, '')}
LOCATION:${location || 'TBA'}
DESCRIPTION:Eventra - Discover and book incredible experiences.
END:VEVENT
END:VCALENDAR`;

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename=event.ics`);
    res.send(ticketData.trim());
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user_id: req.user.id }).session(session);
    if (!booking) throw new Error('Booking not found');

    // Return tickets
    const event = await Event.findById(booking.event_id).session(session);
    if (event) {
      event.tickets_available += booking.quantity;
      event.tickets_booked -= booking.quantity;
      await event.save({ session });
    }

    await Booking.deleteOne({ _id: req.params.id }).session(session);

    await session.commitTransaction();
    res.json({ success: true });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, error: error.message });
  } finally {
    session.endSession();
  }
};
