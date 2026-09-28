import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

function mapIncident(row) {
  return {
    id: row.id,
    code: row.code,
    severity: row.severity,
    category: row.category,
    tag: row.tag,
    meta: row.location_label || (row.latitude != null ? `GPS: ${Number(row.latitude).toFixed(4)}° N, ${Number(row.longitude).toFixed(4)}° E` : ''),
    latitude: row.latitude,
    longitude: row.longitude,
    title: row.title,
    desc: row.description,
    sinhalaText: row.sinhala_text,
    action: row.action_label,
    icon: row.icon,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.filter || 'all';
    let where = '1=1';
    const params = [];
    if (filter === 'critical') where += " AND severity = 'critical'";
    if (filter === 'medical') where += " AND category = 'medical'";
    if (filter === 'open') where += " AND status <> 'resolved'";
    const [rows] = await pool.query(`SELECT * FROM incidents WHERE ${where} ORDER BY created_at DESC LIMIT 200`, params);
    res.json(rows.map(mapIncident));
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM incidents WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Incident not found.' });
    res.json(mapIncident(rows[0]));
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { code, severity = 'amber', category = 'general', tag, title, description, sinhalaText, latitude, longitude, locationLabel, actionLabel, icon = 'alerts' } = req.body || {};
    if (!title) return res.status(400).json({ message: 'Incident title is required.' });
    const finalCode = code || `CB-${Date.now().toString().slice(-6)}`;
    const [result] = await pool.query(
      `INSERT INTO incidents (code, severity, category, tag, title, description, sinhala_text, latitude, longitude, location_label, action_label, icon, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)`,
      [finalCode, severity, category, tag || severity.toUpperCase(), title, description || '', sinhalaText || '', latitude ?? null, longitude ?? null, locationLabel || '', actionLabel || 'DISPATCH UNIT', icon, req.user.id]
    );
    const [rows] = await pool.query('SELECT * FROM incidents WHERE id = ?', [result.insertId]);
    const incident = mapIncident(rows[0]);
    req.app.get('io')?.emit('incident:new', incident);
    res.status(201).json(incident);
  } catch (error) { next(error); }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const allowed = new Set(['open', 'dispatched', 'resolved']);
    const { status } = req.body || {};
    if (!allowed.has(status)) return res.status(400).json({ message: 'Invalid status.' });
    const [result] = await pool.query('UPDATE incidents SET status = ?, updated_at = NOW() WHERE id = ?', [status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Incident not found.' });
    const [rows] = await pool.query('SELECT * FROM incidents WHERE id = ?', [req.params.id]);
    const incident = mapIncident(rows[0]);
    req.app.get('io')?.emit('incident:update', incident);
    res.json(incident);
  } catch (error) { next(error); }
});

router.post('/:id/dispatch', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT * FROM incidents WHERE id = ? FOR UPDATE', [req.params.id]);
    const incident = rows[0];
    if (!incident) { await conn.rollback(); return res.status(404).json({ message: 'Incident not found.' }); }
    const actionLabel = req.body?.actionLabel || incident.action_label || 'DISPATCH UNIT';
    const [result] = await conn.query(
      `INSERT INTO dispatches (incident_id, action_type, action_label, requested_by, status, details_json)
       VALUES (?, 'incident', ?, ?, 'acknowledged', ?)`,
      [incident.id, actionLabel, req.user.id, JSON.stringify(req.body?.details || {})]
    );
    await conn.query("UPDATE incidents SET status = 'dispatched', updated_at = NOW() WHERE id = ?", [incident.id]);
    await conn.commit();
    const payload = { id: result.insertId, incidentId: incident.id, actionLabel, status: 'acknowledged', requestedBy: req.user.fullName };
    req.app.get('io')?.emit('dispatch:new', payload);
    req.app.get('io')?.emit('incident:update', { ...mapIncident(incident), status: 'dispatched' });
    res.status(201).json(payload);
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally { conn.release(); }
});

export default router;
