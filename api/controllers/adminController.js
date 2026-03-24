import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { Booking } from '../models/Booking.js';
import { APIError } from '../middleware/errorHandler.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Aggregate revenue
    const revenueStats = await Booking.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'event_id',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ['$quantity', '$event.price'] } }
        }
      }
    ]);

    const totalRevenue = revenueStats[0]?.totalRevenue || 0;

    // Revenue over time (last 12 months)
    const revenueOverTime = await Booking.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'event_id',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$created_at' } },
          total: { $sum: { $multiply: ['$quantity', '$event.price'] } }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          name: '$_id',
          total: 1,
          _id: 0
        }
      }
    ]);

    // Category stats
    const categoryStats = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0
        }
      }
    ]);

    // Recent Activity
    const recentActivity = await Booking.aggregate([
      { $sort: { created_at: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'events',
          localField: 'event_id',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $project: {
          id: { $toString: '$_id' },
          event_title: '$event.title',
          quantity: 1,
          created_at: 1
        }
      }
    ]);

    res.json({
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue,
      revenueOverTime,
      categoryStats,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find().select('-password').sort({ created_at: -1 }).skip(skip).limit(limit);

    res.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Booking.countDocuments();
    const bookings = await Booking.find()
      .populate('user_id', 'name email username')
      .populate('event_id', 'title price')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const formatted = bookings.map(b => ({
      ...b.toJSON(),
      user: b.user_id,
      event: b.event_id
    }));

    res.json({
      bookings: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      throw new APIError('Cannot delete your own admin account', 400);
    }

    const result = await User.findByIdAndDelete(id);
    if (!result) throw new APIError('User not found', 404);

    await Booking.deleteMany({ user_id: id });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    const user = await User.findById(id);
    if (!user) throw new APIError('User not found', 404);

    user.isAdmin = !!isAdmin;
    user.role = isAdmin ? 'admin' : 'user';
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const uploadImage = (req, res) => {
  if (!req.file) throw new APIError('No file uploaded', 400);

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/uploads/${req.file.filename}`;
  res.json({ url });
};
