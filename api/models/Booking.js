import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  quantity: { type: Number, default: 1, min: 1 },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Virtual for ID
bookingSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

export const Booking = mongoose.model('Booking', bookingSchema);
