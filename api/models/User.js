import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  username: { type: String, unique: true, sparse: true, index: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'super_admin'], 
    default: 'user' 
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  isAdmin: { type: Boolean, default: false } // Keeping for backward compatibility during transition
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const User = mongoose.model('User', userSchema);
