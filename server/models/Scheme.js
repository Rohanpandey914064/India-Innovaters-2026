import mongoose from 'mongoose';

const SchemeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: String,
    eligibility: String,
    link: String,
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Scheme = mongoose.model('Scheme', SchemeSchema);
