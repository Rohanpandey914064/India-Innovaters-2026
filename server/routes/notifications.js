import { Router } from 'express';
import { Notification } from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function stripNotif(doc) {
  if (!doc) return doc;
  const { _id, userId, __v, ...rest } = doc;
  return rest;
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const list = await Notification.find({ userId: req.user.id }).sort({ id: -1 }).lean();
    res.json(list.map((n) => stripNotif(n)));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, type = 'info' } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'message required' });
    const maxDoc = await Notification.findOne({ userId }).sort({ id: -1 }).select('id').lean();
    const nextId = maxDoc?.id != null ? maxDoc.id + 1 : 1;
    const n = await Notification.create({
      userId,
      id: nextId,
      message: message.trim(),
      type,
      read: false,
    });
    res.status(201).json(stripNotif(n.toObject()));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ userId }, { read: true });
    const list = await Notification.find({ userId }).sort({ id: -1 }).lean();
    res.json(list.map((n) => stripNotif(n)));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);
    const n = await Notification.findOneAndUpdate({ userId, id }, { read: true }, { new: true }).lean();
    if (!n) return res.status(404).json({ error: 'Not found' });
    res.json(stripNotif(n));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);
    const r = await Notification.deleteOne({ userId, id });
    if (r.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
