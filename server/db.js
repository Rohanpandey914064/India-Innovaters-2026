/* global process */
import mongoose from 'mongoose';
import { seedIfEmpty, migrateNotificationsToPerUser, ensureLowerAuthorityAccounts } from './seed.js';

export async function connectDb() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cityspark';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected:', uri.replace(/\/\/.*@/, '//***@'));
  await seedIfEmpty();
  await ensureLowerAuthorityAccounts();
  await migrateNotificationsToPerUser();
}