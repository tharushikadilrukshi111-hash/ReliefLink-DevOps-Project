import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT fl.*, u.full_name AS created_by_name
      FROM field_logs fl LEFT JOIN users u ON u.id = fl.created_by
      ORDER BY fl.created_at DESC LIMIT 300
    `);
    res.json(rows);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { unitName, location = '', level = 'info', message } = req.body || {};
    if (!unitName || !message) return res.status(400).json({ message: 'Unit name and message are required.' });
    const [result] = await pool.query(
      'INSERT INTO field_logs (unit_name, location, level, message, created_by) VALUES (?, ?, ?, ?, ?)',
      [unitName, location, level, message, req.user.id]
    );
    const [rows] = await pool.query(`SELECT fl.*, u.full_name AS created_by_name FROM field_logs fl LEFT JOIN users u ON u.id=fl.created_by WHERE fl.id=?`, [result.insertId]);
    req.app.get('io')?.emit('fieldlog:new', rows[0]);
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
});

export default router;
