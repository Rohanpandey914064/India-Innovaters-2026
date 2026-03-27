import { Router } from 'express';
import { Issue } from '../models/Issue.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';
import * as AIService from '../services/AIService.js';

const router = Router();

const AUTHORITY_LEVEL_RANK = { L1: 1, L2: 2, L3: 3 };

function getLevelRank(level) {
  return AUTHORITY_LEVEL_RANK[level] ?? 2;
}

function applyVoteLogic(voteMap, userId, voteValue) {
  const uid = String(userId);
  const current = { ...voteMap };
  const prev = current[uid];
  let upvoteDiff = 0;
  let downvoteDiff = 0;

  if (prev === voteValue) {
    delete current[uid];
    if (voteValue === 1) upvoteDiff = -1;
    if (voteValue === -1) downvoteDiff = -1;
  } else {
    current[uid] = voteValue;
    if (voteValue === 1) {
      upvoteDiff = 1;
      if (prev === -1) downvoteDiff = -1;
    } else if (voteValue === -1) {
      downvoteDiff = 1;
      if (prev === 1) upvoteDiff = -1;
    }
  }
  return { voteMap: current, upvoteDiff, downvoteDiff };
}

router.post('/', requireAuth, async (req, res) => {
  try {
    const existingIssues = await Issue.find({ progress: { $ne: 'Resolved' } }).lean();
    const duplicate = AIService.findDuplicate(req.body, existingIssues);

    if (duplicate) {
      // Auto-upvote the duplicate
      const vm = duplicate.voteMap && typeof duplicate.voteMap === 'object' ? { ...duplicate.voteMap } : {};
      const { voteMap, upvoteDiff, downvoteDiff } = applyVoteLogic(vm, req.user.id, 1);
      
      const updatedDuplicate = await Issue.findOneAndUpdate(
        { id: duplicate.id },
        { 
          voteMap, 
          $inc: { upvotes: upvoteDiff, downvotes: downvoteDiff },
          isRepeat: true 
        },
        { new: true }
      );

      const o = updatedDuplicate.toObject();
      delete o.voteMap;
      delete o.comments;
      return res.status(200).json({ ...o, duplicate: true });
    }

    const aiFeatures = await AIService.classifyIssue(req.body.title, req.body.description);
    const prediction = await AIService.analyzePredictiveRisks(req.body);
    const priorityScore = AIService.calculatePriorityScore({ ...req.body, ...aiFeatures });
    const priorityLabel = AIService.getPriorityLabel(priorityScore);

    const maxDoc = await Issue.findOne().sort({ id: -1 }).select('id').lean();
    const nextId = maxDoc?.id != null ? maxDoc.id + 1 : Date.now();

    const doc = await Issue.create({
      id: nextId,
      title: req.body.title,
      description: req.body.description || '',
      category: aiFeatures.category || req.body.category,
      location: req.body.location || '',
      address: req.body.address || '',
      lat: req.body.lat,
      lng: req.body.lng,
      authorId: req.user.id,
      img: req.body.img,
      progress: 'Reported',
      upvotes: 0,
      downvotes: 0,
      voteMap: {},
      comments: [],
      
      // AI Features
      department: aiFeatures.department,
      priorityScore,
      priorityLabel,
      prediction,
      verificationStatus: 'Pending'
    });

    const o = doc.toObject();
    delete o.voteMap;
    delete o.comments;
    res.status(201).json(o);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/:issueId/vote', requireAuth, async (req, res) => {
  try {
    const issueId = Number(req.params.issueId);
    const { voteValue } = req.body;
    if (voteValue === undefined || voteValue === null) {
      return res.status(400).json({ error: 'voteValue is required' });
    }
    const userId = req.user.id;

    const issue = await Issue.findOne({ id: issueId });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const vm = issue.voteMap && typeof issue.voteMap === 'object' ? { ...issue.voteMap } : {};
    const { voteMap, upvoteDiff, downvoteDiff } = applyVoteLogic(vm, userId, voteValue);

    issue.voteMap = voteMap;
    issue.upvotes = (issue.upvotes ?? 0) + upvoteDiff;
    issue.downvotes = (issue.downvotes ?? 0) + downvoteDiff;

    // Recalculate Priority
    issue.priorityScore = AIService.calculatePriorityScore(issue, voteMap);
    issue.priorityLabel = AIService.getPriorityLabel(issue.priorityScore);

    // Escalation Logic: If upvotes > 5, flag as escalated
    if (issue.upvotes > 5 && !issue.escalation) {
      issue.escalation = {
        type: 'Public Escalation',
        message: 'High community interest detected. Escalated to Department Head.',
        level: 'Urgent'
      };
    }

    await issue.save();

    const o = issue.toObject();
    const votesForIssue = o.voteMap && typeof o.voteMap === 'object' ? { ...o.voteMap } : {};
    delete o.voteMap;
    delete o.comments;

    res.json({ issue: o, votesForIssue });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/:issueId/comments', requireAuth, async (req, res) => {
  try {
    const issueId = Number(req.params.issueId);
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Comment text is required' });

    const issue = await Issue.findOne({ id: issueId });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const comment = {
      id: Date.now(),
      text: text.trim(),
      authorId: req.user.id,
      authorName: req.user.name || 'Citizen',
      timestamp: new Date().toISOString(),
    };
    issue.comments = [...(issue.comments || []), comment];
    await issue.save();

    res.status(201).json(comment);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:issueId', requireAuth, async (req, res) => {
  try {
    const issueId = Number(req.params.issueId);
    if (!Number.isFinite(issueId)) {
      return res.status(400).json({ error: 'Invalid issue id' });
    }

    const issue = await Issue.findOne({ id: issueId }).lean();
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const isOwner = String(issue.authorId) === String(req.user.id);
    if (!isOwner) {
      return res.status(403).json({ error: 'Only the report owner can delete this issue' });
    }

    await Issue.deleteOne({ id: issueId });
    res.json({ ok: true, id: issueId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/authorities', requireAuth, async (req, res) => {
  try {
    if (!['admin', 'authority'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Admin or authority access required' });
    }

    const authorities = await User.find({ role: 'authority' })
      .select('_id name email department designation authorityLevel')
      .lean();

    const counts = await Issue.aggregate([
      { $match: { assignedTo: { $exists: true, $ne: null }, progress: { $ne: 'Resolved' } } },
      { $group: { _id: '$assignedTo', openIssues: { $sum: 1 } } },
    ]);

    const issueCountByAuthorityId = Object.fromEntries(
      counts.map((entry) => [String(entry._id), entry.openIssues])
    );

    const list = authorities
      .map((a) => ({
        id: String(a._id),
        name: a.name,
        email: a.email,
        role: 'authority',
        department: a.department || 'General Administration',
        designation: a.designation || 'Field Officer',
        authorityLevel: a.authorityLevel || 'L2',
        openIssues: issueCountByAuthorityId[String(a._id)] || 0,
      }))
      .sort((a, b) => {
        const byLevel = getLevelRank(a.authorityLevel) - getLevelRank(b.authorityLevel);
        if (byLevel !== 0) return byLevel;
        return a.openIssues - b.openIssues;
      });

    res.json({ authorities: list });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Authority Assignment (Admin only)
router.patch('/:issueId/assign', requireAuth, async (req, res) => {
  try {
    if (!['admin', 'authority'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Admin or authority access required' });
    }

    const { authorityId, deadline, note, mode = 'direct' } = req.body;
    if (!authorityId) return res.status(400).json({ error: 'authorityId is required' });

    const issue = await Issue.findOne({ id: Number(req.params.issueId) });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const targetAuthority = await User.findOne({ _id: authorityId, role: 'authority' })
      .select('_id name authorityLevel department')
      .lean();
    if (!targetAuthority) {
      return res.status(400).json({ error: 'Target user is not a valid authority account' });
    }

    if (req.user.role === 'authority') {
      const sourceAuthority = await User.findById(req.user.id)
        .select('_id authorityLevel department')
        .lean();
      if (!sourceAuthority) {
        return res.status(403).json({ error: 'Authority profile not found' });
      }
      const sourceRank = getLevelRank(sourceAuthority.authorityLevel);
      const targetRank = getLevelRank(targetAuthority.authorityLevel);
      if (targetRank <= sourceRank) {
        return res.status(403).json({ error: 'Authorities can only delegate to lower levels' });
      }
      if (
        sourceAuthority.department &&
        targetAuthority.department &&
        sourceAuthority.department !== targetAuthority.department
      ) {
        return res.status(403).json({ error: 'Cross-department delegation is not allowed for authorities' });
      }
    }

    const now = new Date();
    issue.assignedTo = authorityId;
    issue.assignedToName = targetAuthority.name;
    issue.assignedBy = req.user.id;
    issue.assignmentMode = mode === 'lower-delegation' ? 'lower-delegation' : 'direct';
    issue.assignmentNote = note?.trim() || '';
    issue.deadline = deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    issue.progress = 'In Progress';
    issue.assignmentHistory = [
      ...(Array.isArray(issue.assignmentHistory) ? issue.assignmentHistory : []),
      {
        assignedTo: authorityId,
        assignedBy: req.user.id,
        mode: issue.assignmentMode,
        note: issue.assignmentNote,
        at: now.toISOString(),
      },
    ];
    await issue.save();

    res.json(issue);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Completion Upload (Authority only)
router.patch('/:issueId/resolve', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'authority') return res.status(403).json({ error: 'Authority access required' });
    const { completionImg, completionDescription } = req.body;
    if (!completionImg?.trim()) {
      return res.status(400).json({ error: 'Completion image is required' });
    }
    if (!completionDescription?.trim()) {
      return res.status(400).json({ error: 'Completion description is required' });
    }

    const issue = await Issue.findOne({ id: Number(req.params.issueId) });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    if (!issue.assignedTo || String(issue.assignedTo) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Only assigned authority can submit completion' });
    }

    issue.progress = 'Resolved';
    issue.completionImg = completionImg.trim();
    issue.completionDescription = completionDescription.trim();
    issue.completedAt = new Date();
    issue.verificationStatus = 'Pending';
    await issue.save();

    res.json(issue);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// User Verification
router.post('/:issueId/verify', requireAuth, async (req, res) => {
  try {
    const { status, comment } = req.body;
    const issueId = Number(req.params.issueId);

    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be Verified or Rejected' });
    }

    const issue = await Issue.findOne({ id: issueId });
    if (!issue || issue.progress !== 'Resolved') return res.status(400).json({ error: 'Issue must be resolved to verify' });

    if (String(issue.authorId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Only the reporting user can verify this issue' });
    }

    const cleanComment = String(comment || '').trim();
    if (status === 'Rejected' && !cleanComment) {
      return res.status(400).json({ error: 'Please provide a rejection message for admin review' });
    }

    issue.verificationStatus = status;
    issue.verificationComment = cleanComment;
    issue.verificationBy = req.user.id;

    if (status === 'Verified') {
      issue.verifiedAt = new Date();
      issue.needsAdminReview = false;
      issue.adminReviewNote = '';
      issue.adminReviewedAt = undefined;
      issue.adminReviewedBy = undefined;
    } else {
      issue.rejectedAt = new Date();
      issue.needsAdminReview = true;
      issue.progress = 'In Progress';

      const admins = await User.find({ role: 'admin' }).select('_id').lean();
      for (const admin of admins) {
        const adminId = String(admin._id);
        const maxDoc = await Notification.findOne({ userId: adminId }).sort({ id: -1 }).select('id').lean();
        const nextId = maxDoc?.id != null ? maxDoc.id + 1 : 1;
        await Notification.create({
          userId: adminId,
          id: nextId,
          type: 'warning',
          read: false,
          message: `Rework requested by reporter for issue [${issue.title}]. Message: ${cleanComment}`,
        });
      }
    }

    await issue.save();

    res.json({ message: 'Verification recorded', status, issue });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.patch('/:issueId/admin-review', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const issue = await Issue.findOne({ id: Number(req.params.issueId) });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const action = String(req.body?.action || 'review').trim();
    if (!['review', 'mark_completed'].includes(action)) {
      return res.status(400).json({ error: 'action must be "review" or "mark_completed"' });
    }

    issue.needsAdminReview = false;
    issue.adminReviewNote = String(req.body?.note || '').trim();
    issue.adminReviewedAt = new Date();
    issue.adminReviewedBy = req.user.id;

    if (action === 'mark_completed') {
      issue.progress = 'Resolved';
      issue.verificationStatus = 'Verified';
      issue.resolutionStatus = 'admin_override';
      issue.verifiedAt = new Date();
      issue.rejectedAt = undefined;
    }

    await issue.save();
    res.json(issue);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// User Appeals for Resolved Issues
router.post('/:issueId/appeal', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    const issueId = Number(req.params.issueId);

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message is required for appeal' });
    }

    const issue = await Issue.findOne({ id: issueId });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (issue.progress !== 'Resolved') {
      return res.status(400).json({ error: 'Can only appeal resolved issues' });
    }

    if (String(issue.authorId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Only the reporting user can appeal this issue' });
    }

    // Create new appeal
    const maxAppeal = issue.appeals && issue.appeals.length > 0 
      ? Math.max(...issue.appeals.map(a => a.id || 0))
      : 0;

    const newAppeal = {
      id: maxAppeal + 1,
      userId: req.user.id,
      userName: req.user.name || 'User',
      message: String(message).trim(),
      timestamp: new Date(),
      status: 'pending',
      adminAction: 'none',
      adminNote: '',
    };

    if (!Array.isArray(issue.appeals)) {
      issue.appeals = [];
    }
    issue.appeals.push(newAppeal);

    // Notify admins
    const admins = await User.find({ role: 'admin' }).select('_id').lean();
    for (const admin of admins) {
      const adminId = String(admin._id);
      const maxDoc = await Notification.findOne({ userId: adminId }).sort({ id: -1 }).select('id').lean();
      const nextId = maxDoc?.id != null ? maxDoc.id + 1 : 1;
      await Notification.create({
        userId: adminId,
        id: nextId,
        type: 'alert',
        read: false,
        message: `Resolution dispute: User appealed completion of "${issue.title}". Appeal message: "${newAppeal.message}"`,
      });
    }

    await issue.save();
    res.json({ message: 'Appeal filed successfully', appeal: newAppeal, issue });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin Handles Appeal (Reassign or Admin Override)
router.put('/:issueId/appeal/:appealId/action', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { action, note, authorityId } = req.body;
    const issueId = Number(req.params.issueId);
    const appealId = Number(req.params.appealId);

    if (!['reassigned', 'admin_override'].includes(action)) {
      return res.status(400).json({ error: 'action must be "reassigned" or "admin_override"' });
    }

    const issue = await Issue.findOne({ id: issueId });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const appeal = issue.appeals?.find(a => a.id === appealId);
    if (!appeal) return res.status(404).json({ error: 'Appeal not found' });

    // Update appeal
    appeal.status = 'reviewed';
    appeal.adminAction = action;
    appeal.adminNote = String(note || '').trim();
    appeal.adminReviewedAt = new Date();
    appeal.adminReviewedBy = req.user.id;

    if (action === 'reassigned') {
      // Reopen issue and reassign
      if (!authorityId) {
        return res.status(400).json({ error: 'authorityId is required for reassignment' });
      }

      const targetAuthority = await User.findOne({ _id: authorityId, role: 'authority' })
        .select('_id name authorityLevel')
        .lean();
      if (!targetAuthority) {
        return res.status(400).json({ error: 'Target authority not found' });
      }

      issue.progress = 'In Progress';
      issue.resolutionStatus = 'reopened';
      issue.assignedTo = authorityId;
      issue.assignedToName = targetAuthority.name;
      issue.assignedBy = req.user.id;
      issue.assignmentNote = `Admin reopened: ${appeal.adminNote || 'Resolution was inadequate'}`;
      issue.completionImg = '';
      issue.completionDescription = '';
      issue.completedAt = undefined;
      issue.verificationStatus = 'Pending';

      // Notify the new authority
      const adminId = String(req.user.id);
      const maxDoc = await Notification.findOne({ userId: authorityId }).sort({ id: -1 }).select('id').lean();
      const nextId = maxDoc?.id != null ? maxDoc.id + 1 : 1;
      await Notification.create({
        userId: String(authorityId),
        id: nextId,
        type: 'alert',
        read: false,
        message: `Issue "${issue.title}" reassigned to you due to user appeal. Previous work was deemed inadequate.`,
      });
    } else if (action === 'admin_override') {
      // Keep as resolved, but mark admin override
      issue.resolutionStatus = 'admin_override';
      // Don't change progress, stay Resolved
    }

    await issue.save();
    res.json({ message: 'Appeal action completed', appeal, issue });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
