import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.post('/quick', async (req, res, next) => {
  try {
    const { actionLabel, details = {} } = req.body || {};
    if (!actionLabel) return res.status(400).json({ message: 'Action label is required.' });
    const [result] = await pool.query(
      `INSERT INTO dispatches (incident_id, action_type, action_label, requested_by, status, details_json)
       VALUES (NULL, 'quick', ?, ?, 'acknowledged', ?)`,
      [actionLabel, req.user.id, JSON.stringify(details)]
    );
    const payload = { id: result.insertId, actionLabel, status: 'acknowledged', requestedBy: req.user.fullName, createdAt: new Date().toISOString() };
    req.app.get('io')?.emit('dispatch:new', payload);
    res.status(201).json(payload);
  } catch (error) { next(error); }
});

router.post('/siren', async (req, res, next) => {
  try {
    const active = Boolean(req.body?.active);
    const message = active ? 'Southern Maritime Corridor siren broadcast activated.' : 'Siren broadcast paused.';
    const [result] = await pool.query('INSERT INTO alerts (type, message, is_active, triggered_by) VALUES (?, ?, ?, ?)', ['siren', message, active ? 1 : 0, req.user.id]);
    const payload = { id: result.insertId, type: 'siren', active, message, by: req.user.fullName };
    req.app.get('io')?.emit('alert:update', payload);
    res.status(201).json(payload);
  } catch (error) { next(error); }
});

router.post('/sos-trigger', async (req, res, next) => {
  try {
    const active = req.body?.active !== false;
    const message = active ? 'Level 4 national SOS protocol activated.' : 'Level 4 SOS protocol deactivated.';
    const [result] = await pool.query('INSERT INTO alerts (type, message, is_active, triggered_by) VALUES (?, ?, ?, ?)', ['sos', message, active ? 1 : 0, req.user.id]);
    const payload = { id: result.insertId, type: 'sos', active, message, by: req.user.fullName };
    req.app.get('io')?.emit('alert:update', payload);
    res.status(201).json(payload);
  } catch (error) { next(error); }
});

router.get('/dispatches', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT d.*, u.full_name AS requested_by_name FROM dispatches d LEFT JOIN users u ON u.id=d.requested_by ORDER BY d.created_at DESC LIMIT 200`);
    res.json(rows);
  } catch (error) { next(error); }
});

export default router;
