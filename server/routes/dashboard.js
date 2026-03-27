import { Router } from 'express';
import { Issue } from '../models/Issue.js';
import { Scheme } from '../models/Scheme.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// User Stats
router.get('/user-stats', requireAuth, async (req, res) => {
  try {
    const stats = await Issue.aggregate([
      { $match: { authorId: req.user.id } },
      { $group: { _id: '$progress', count: { $sum: 1 } } }
    ]);
    
    const formatted = { Reported: 0, 'In Progress': 0, Resolved: 0 };
    stats.forEach(s => { formatted[s._id] = s.count; });
    
    res.json(formatted);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin Stats
router.get('/admin-stats', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    
    const totalIssues = await Issue.countDocuments();
    const urgentIssues = await Issue.countDocuments({ priorityLabel: { $in: ['High', 'Critical'] } });
    const resolvedIssues = await Issue.countDocuments({ progress: 'Resolved' });
    const pendingVerification = await Issue.countDocuments({ progress: 'Resolved', verificationStatus: 'Pending' });

    res.json({
      totalIssues,
      urgentIssues,
      resolvedIssues,
      pendingVerification
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Schemes
router.get('/schemes', async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ publishedAt: -1 });
    res.json(schemes);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
