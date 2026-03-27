import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cityspark';

try {
  await mongoose.connect(uri);
  const st = mongoose.connection.readyState;
  const labels = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  console.log('MONGODB_URI:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***@'));
  console.log('readyState:', st, '(' + (labels[st] || st) + ')');

  const db = mongoose.connection.db;
  const cols = await db.listCollections().toArray();
  console.log('Collections:', cols.map((c) => c.name).join(', ') || '(empty)');

  const issues = await db.collection('issues').countDocuments();
  const users = await db.collection('users').countDocuments();
  const notifs = await db.collection('notifications').countDocuments();
  console.log('Counts — issues:', issues, '| users:', users, '| notifications:', notifs);

  await mongoose.disconnect();
  console.log('Result: MongoDB connection OK.');
  process.exit(0);
} catch (e) {
  console.error('Result: FAILED —', e.message);
  process.exit(1);
}
