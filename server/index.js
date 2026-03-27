import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDb } from './db.js';
import { Issue } from './models/Issue.js';
import issuesRouter from './routes/issues.js';
import authRouter from './routes/auth.js';
import notificationsRouter from './routes/notifications.js';
import dashboardRouter from './routes/dashboard.js';
import aiRouter from './routes/ai.js';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mongo: true });
});

app.get('/api/bootstrap', async (_req, res) => {
  try {
    const issues = await Issue.find().sort({ id: -1 }).lean();
    const votes = {};
    const comments = {};
    const issueList = issues.map((i) => {
      votes[i.id] = i.voteMap && typeof i.voteMap === 'object' ? { ...i.voteMap } : {};
      comments[i.id] = Array.isArray(i.comments) ? i.comments : [];
      const { _id, voteMap, comments: _c, __v, ...rest } = i;
      return rest;
    });

    res.json({ issues: issueList, votes, comments });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use('/api/issues', issuesRouter);
app.use('/api/auth', authRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/ai', aiRouter);

const PORT = Number(process.env.PORT) || 5000;

connectDb()
  .then(() => {
    const HOST = process.env.HOST || '0.0.0.0';
    const server = app.listen(PORT, HOST, () => {
      console.log(`CitySpark API listening on ${HOST}:${PORT}`);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `\nPort ${PORT} is already in use (another CitySpark server or app is running).\n` +
            `  • Stop it:  netstat -ano | findstr :${PORT}   then   taskkill /PID <pid> /F\n` +
            `  • Or use another port: set PORT=5001 in server/.env and update Vite proxy if needed.\n`
        );
        process.exit(1);
      }
      throw err;
    });
  })
  .catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
