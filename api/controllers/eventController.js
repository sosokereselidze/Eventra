import { v4 as uuidv4 } from 'uuid';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';
import { APIError } from '../middleware/errorHandler.js';

export const getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Server-side filtering
    const query = {};
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.featured === 'true') {
      query.featured = true;
    }

    // Sorting
    let sort = { date: 1 };
    if (req.query.sort) {
      const parts = req.query.sort.split(':');
      if (parts.length === 2) {
        sort = { [parts[0]]: parts[1] === 'desc' ? -1 : 1 };
      } else {
        sort = { [req.query.sort]: 1 };
      }
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ featured: true }).limit(6);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    // The original code had `res.json(result);` but `result` was not defined.
    // Assuming `event` was intended here.
    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    // The original code used `getCollections()` and `events.deleteOne()`,
    // which is not consistent with Mongoose `Event.findByIdAndDelete()`.
    // Assuming the intent is to delete using Mongoose.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) throw new APIError('Event not found', 404);

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getSimilarEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const similar = await Event.find({
      category: event.category,
      _id: { $ne: event._id },
      date: { $gte: new Date() }
    }).limit(3);

    res.json(similar);
  } catch (error) {
    next(error);
  }
};
