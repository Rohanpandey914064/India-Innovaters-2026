import jwt from 'jsonwebtoken';

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    return 'cityspark-dev-only-not-for-production';
  }
  return s;
}

const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

export function signAccessToken(userDoc) {
  const payload = {
    sub: userDoc._id.toString(),
    email: userDoc.email,
    name: userDoc.name,
    role: userDoc.role,
  };
  return jwt.sign(payload, getSecret(), { expiresIn: EXPIRES });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getSecret());
}
