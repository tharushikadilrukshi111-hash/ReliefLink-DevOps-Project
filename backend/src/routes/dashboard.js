import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/summary', async (req, res, next) => {
  try {
    const [[metrics]] = await pool.query('SELECT * FROM system_metrics WHERE id = 1');
    const [units] = await pool.query('SELECT id, name, unit_type, readiness_percent, status, location, capacity FROM response_units ORDER BY id');
    const [[counts]] = await pool.query(`
      SELECT
        SUM(status <> 'resolved') AS open_incidents,
        SUM(severity = 'critical' AND status <> 'resolved') AS critical_incidents,
        SUM(category = 'medical' AND status <> 'resolved') AS medical_incidents
      FROM incidents
    `);
    res.json({ metrics, units, counts });
  } catch (error) { next(error); }
});

export default router;
