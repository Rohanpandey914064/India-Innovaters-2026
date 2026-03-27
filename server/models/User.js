import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    zip: { type: String, trim: true },
    lat: { type: Number },
    lng: { type: Number },
    role: { type: String, enum: ['user', 'admin', 'authority'], default: 'user' },
    department: { type: String, trim: true },
    designation: { type: String, trim: true },
    authorityLevel: { type: String, enum: ['L1', 'L2', 'L3'], default: 'L2' },
    points: { type: Number, default: 0 },
    badges: { type: Array, default: [] },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', UserSchema);
