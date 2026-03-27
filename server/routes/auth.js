import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';
import { OTP } from '../models/OTP.js';
import { Notification } from '../models/Notification.js';
import { validatePassword } from '../utils/password.js';
import { signAccessToken } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const ROUNDS = 10; // Lowered from 12 for better responsiveness in this environment

const loginSignupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { error: 'Too many attempts. Please try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function toPublicUser(doc) {
  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    role: doc.role,
    department: doc.department,
    designation: doc.designation,
    authorityLevel: doc.authorityLevel,
    phone: doc.phone,
    address: doc.address,
    isVerified: doc.isVerified,
    points: doc.points,
    badges: doc.badges,
  };
}

function issueToken(user) {
  return signAccessToken(user);
}

router.post('/signup', loginSignupLimiter, async (req, res) => {
  console.log(`[AUTH] Signup attempt for: ${req.body.email}`);
  try {
    const { name, email, password, phone, address, zip, lat, lng } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const pwdErr = validatePassword(password);
    if (pwdErr) {
      console.warn(`[AUTH] Password validation failed for ${email}: ${pwdErr}`);
      return res.status(400).json({ error: pwdErr });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      console.warn(`[AUTH] Signup failed: Email ${email} already registered`);
      return res.status(409).json({ error: 'This email is already registered' });
    }

    console.log(`[AUTH] Hashing password for ${email}...`);
    const passwordHash = await bcrypt.hash(password, ROUNDS);
    
    console.log(`[AUTH] Creating user record for ${email}...`);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      phone,
      address,
      zip,
      lat,
      lng,
      role: 'user',
    });

    console.log(`[AUTH] User created: ${user._id}. Issuing token...`);

    try {
      await Notification.create({
        userId: user._id.toString(),
        id: 1,
        message: 'Welcome to CitySpark! Please verify your mobile number to start voting.',
        type: 'info',
        read: false,
      });
    } catch (e) {
      console.warn('[AUTH] Welcome notification error:', e.message);
    }

    const token = issueToken(user);
    console.log(`[AUTH] Signup successful for ${email}`);
    res.status(201).json({ user: toPublicUser(user), token });
  } catch (e) {
    console.error(`[AUTH] Signup error for ${req.body.email}:`, e);
    res.status(400).json({ error: e.message });
  }
});

router.post('/send-otp', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.phone) return res.status(400).json({ error: 'No phone number linked to account' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndDelete({ phone: user.phone });
    await OTP.create({ phone: user.phone, code, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

    console.log(`[SIMULATION] OTP for ${user.phone}: ${code}`);
    res.json({ message: 'OTP sent successfully (Simulated)' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/verify-otp', requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id);
    const otp = await OTP.findOne({ phone: user.phone, code });

    if (!otp) return res.status(400).json({ error: 'Invalid or expired OTP' });

    user.isVerified = true;
    await user.save();
    await OTP.deleteOne({ _id: otp._id });

    res.json({ message: 'Mobile verification successful', user: toPublicUser(user) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/login', loginSignupLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = issueToken(user);
    res.json({ user: toPublicUser(user), token });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(401).json({ error: 'Account not found' });
    res.json({ user: toPublicUser(user) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;

