import crypto from 'crypto';

const KEY_LENGTH = 64;

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return { salt, hash };
}

export function verifyPassword(password, salt, storedHash) {
  const candidate = crypto.scryptSync(password, salt, KEY_LENGTH);
  const stored = Buffer.from(storedHash, 'hex');
  return stored.length === candidate.length && crypto.timingSafeEqual(candidate, stored);
}
