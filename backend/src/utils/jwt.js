import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

export function createToken(payload) {
  if (!secret) throw new Error('JWT_SECRET no está configurado.');
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '2h' });
}

export function verifyToken(token) {
  if (!secret) throw new Error('JWT_SECRET no está configurado.');
  return jwt.verify(token, secret);
}
