import { Router } from 'express';
import { getCivicGuidance } from '../services/AIService.js';

const router = Router();

router.post('/assistant', async (req, res) => {
  try {
    const { query, category, location, language, queryEnglish } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const queryWithContext = [
      query,
      queryEnglish ? `English Query: ${queryEnglish}` : '',
      category ? `Category: ${category}` : '',
      location ? `Location: ${location}` : ''
    ].filter(Boolean).join(' | ');

    const guidance = await getCivicGuidance(queryWithContext, language || 'en');
    res.json(guidance);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
