import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res, next) => {
  try { const [rows] = await pool.query('SELECT * FROM inventory_items ORDER BY name'); res.json(rows); }
  catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { sku, name, category = 'General', quantity = 0, unit = 'units', reorderLevel = 0, location = 'Central Store' } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Item name is required.' });
    const finalSku = sku || `SKU-${Date.now().toString().slice(-6)}`;
    const status = Number(quantity) <= Number(reorderLevel) ? 'low' : 'ok';
    const [result] = await pool.query(
      'INSERT INTO inventory_items (sku, name, category, quantity, unit, reorder_level, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [finalSku, name, category, Number(quantity), unit, Number(reorderLevel), location, status]
    );
    const [rows] = await pool.query('SELECT * FROM inventory_items WHERE id = ?', [result.insertId]);
    req.app.get('io')?.emit('inventory:update', rows[0]);
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const [currentRows] = await pool.query('SELECT * FROM inventory_items WHERE id = ?', [req.params.id]);
    if (!currentRows[0]) return res.status(404).json({ message: 'Inventory item not found.' });
    const current = currentRows[0];
    const quantity = req.body.quantity ?? current.quantity;
    const reorderLevel = req.body.reorderLevel ?? current.reorder_level;
    const status = Number(quantity) <= Number(reorderLevel) ? 'low' : 'ok';
    await pool.query(
      `UPDATE inventory_items SET name=?, category=?, quantity=?, unit=?, reorder_level=?, location=?, status=?, updated_at=NOW() WHERE id=?`,
      [req.body.name ?? current.name, req.body.category ?? current.category, Number(quantity), req.body.unit ?? current.unit, Number(reorderLevel), req.body.location ?? current.location, status, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM inventory_items WHERE id = ?', [req.params.id]);
    req.app.get('io')?.emit('inventory:update', rows[0]);
    res.json(rows[0]);
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM inventory_items WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Inventory item not found.' });
    req.app.get('io')?.emit('inventory:delete', { id: Number(req.params.id) });
    res.status(204).end();
  } catch (error) { next(error); }
});

export default router;
