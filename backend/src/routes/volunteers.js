import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res, next) => {
  try { const [rows] = await pool.query('SELECT * FROM volunteers ORDER BY created_at DESC'); res.json(rows); }
  catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { fullName, phone = '', skills = '', district = '', status = 'available', assignedUnit = '' } = req.body || {};
    if (!fullName) return res.status(400).json({ message: 'Volunteer name is required.' });
    const code = `VOL-${Date.now().toString().slice(-6)}`;
    const [result] = await pool.query(
      'INSERT INTO volunteers (code, full_name, phone, skills, district, status, assigned_unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [code, fullName, phone, skills, district, status, assignedUnit]
    );
    const [rows] = await pool.query('SELECT * FROM volunteers WHERE id = ?', [result.insertId]);
    req.app.get('io')?.emit('volunteer:update', rows[0]);
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const [currentRows] = await pool.query('SELECT * FROM volunteers WHERE id = ?', [req.params.id]);
    if (!currentRows[0]) return res.status(404).json({ message: 'Volunteer not found.' });
    const v = currentRows[0];
    await pool.query(
      `UPDATE volunteers SET full_name=?, phone=?, skills=?, district=?, status=?, assigned_unit=?, updated_at=NOW() WHERE id=?`,
      [req.body.fullName ?? v.full_name, req.body.phone ?? v.phone, req.body.skills ?? v.skills, req.body.district ?? v.district, req.body.status ?? v.status, req.body.assignedUnit ?? v.assigned_unit, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM volunteers WHERE id = ?', [req.params.id]);
    req.app.get('io')?.emit('volunteer:update', rows[0]);
    res.json(rows[0]);
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM volunteers WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Volunteer not found.' });
    req.app.get('io')?.emit('volunteer:delete', { id: Number(req.params.id) });
    res.status(204).end();
  } catch (error) { next(error); }
});

export default router;
