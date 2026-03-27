import mongoose from 'mongoose';

const VerificationLogSchema = new mongoose.Schema(
  {
    issueId: { type: Number, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Verified', 'Rejected'], required: true },
    comment: String,
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const VerificationLog = mongoose.model('VerificationLog', VerificationLogSchema);
