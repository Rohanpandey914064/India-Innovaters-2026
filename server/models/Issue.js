import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    text: String,
    authorId: mongoose.Schema.Types.Mixed,
    authorName: String,
    timestamp: String,
  },
  { _id: false }
);

const AppealSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    userId: mongoose.Schema.Types.Mixed,
    userName: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
    adminAction: { type: String, enum: ['reassigned', 'admin_override', 'none'], default: 'none' },
    adminNote: String,
    adminReviewedAt: Date,
    adminReviewedBy: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const IssueSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    title: String,
    titles: { type: mongoose.Schema.Types.Mixed, default: undefined },
    description: String,
    descriptions: { type: mongoose.Schema.Types.Mixed, default: undefined },
    category: String,
    location: String,
    address: String,
    progress: { type: String, default: 'Reported' },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    authorId: mongoose.Schema.Types.Mixed,
    lat: Number,
    lng: Number,
    img: String,
    voteMap: { type: Object, default: {} },
    comments: { type: [CommentSchema], default: [] },
    
    // Industry Level Features
    priorityScore: { type: Number, default: 0 },
    priorityLabel: { type: String, default: 'Low' },
    department: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedToName: String,
    assignedBy: mongoose.Schema.Types.Mixed,
    assignmentMode: { type: String, enum: ['direct', 'lower-delegation'], default: 'direct' },
    assignmentNote: String,
    assignmentHistory: { type: [mongoose.Schema.Types.Mixed], default: [] },
    deadline: Date,
    prediction: { type: mongoose.Schema.Types.Mixed },
    escalation: { type: mongoose.Schema.Types.Mixed },
    verificationStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
    verificationComment: String,
    verificationBy: mongoose.Schema.Types.Mixed,
    verifiedAt: Date,
    rejectedAt: Date,
    needsAdminReview: { type: Boolean, default: false },
    adminReviewNote: String,
    adminReviewedAt: Date,
    adminReviewedBy: mongoose.Schema.Types.Mixed,
    completionImg: String,
    completionDescription: String,
    completedAt: Date,
    isRepeat: { type: Boolean, default: false },
    
    // Resolution Disputes
    appeals: { type: [AppealSchema], default: [] },
    resolutionStatus: { type: String, enum: ['resolved', 'admin_override', 'reopened'], default: 'resolved' },
  },
  { timestamps: true }
);

export const Issue = mongoose.model('Issue', IssueSchema);
