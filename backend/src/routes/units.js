import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res, next) => {
  try { const [rows] = await pool.query('SELECT * FROM response_units ORDER BY id'); res.json(rows); }
  catch (error) { next(error); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const [currentRows] = await pool.query('SELECT * FROM response_units WHERE id=?', [req.params.id]);
    if (!currentRows[0]) return res.status(404).json({ message: 'Response unit not found.' });
    const u = currentRows[0];
    await pool.query(
      `UPDATE response_units SET readiness_percent=?, status=?, location=?, capacity=?, updated_at=NOW() WHERE id=?`,
      [req.body.readinessPercent ?? u.readiness_percent, req.body.status ?? u.status, req.body.location ?? u.location, req.body.capacity ?? u.capacity, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM response_units WHERE id=?', [req.params.id]);
    req.app.get('io')?.emit('unit:update', rows[0]);
    res.json(rows[0]);
  } catch (error) { next(error); }
});

export default router;
