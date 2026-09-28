import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { verifyPassword } from '../utils/password.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });

    const [rows] = await pool.query(
      'SELECT id, username, password_salt, password_hash, full_name, role FROM users WHERE username = ? AND is_active = 1 LIMIT 1',
      [username]
    );
    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_salt, user.password_hash)) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const payload = { id: user.id, username: user.username, fullName: user.full_name, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
    res.json({ token, user: payload });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, async (req, res) => res.json({ user: req.user }));

export default router;
