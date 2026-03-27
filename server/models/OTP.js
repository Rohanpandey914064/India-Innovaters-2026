import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL Index
  },
  { timestamps: true }
);

export const OTP = mongoose.model('OTP', OTPSchema);
