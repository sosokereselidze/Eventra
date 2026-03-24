import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  date: { type: Date, required: true, index: true },
  location: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  tickets_available: { type: Number, required: true, min: 0 },
  tickets_booked: { type: Number, default: 0 },
  category: { type: String, required: true, index: true },
  image_url: { type: String },
  featured: { type: Boolean, default: false, index: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Virtual for ID to maintain compatibility with existing frontend
eventSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

export const Event = mongoose.model('Event', eventSchema);
