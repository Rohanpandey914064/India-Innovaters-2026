import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    id: { type: Number, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'info' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, id: 1 }, { unique: true });

export const Notification = mongoose.model('Notification', NotificationSchema);
