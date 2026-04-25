import { Router, Response } from 'express';
import pool from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/inventory
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { category, search, low_stock } = req.query;
  let query = 'SELECT * FROM inventory WHERE 1=1';
  const params: any[] = [];
  let pi = 0;

  if (category) { query += ` AND category = $${++pi}`; params.push(category); }
  if (search) {
    const s = `%${search}%`;
    query += ` AND (name ILIKE $${++pi} OR sku ILIKE $${++pi})`;
    params.push(s, s);
  }
  if (low_stock === 'true') { query += ' AND quantity <= low_stock_threshold'; }

  query += ' ORDER BY name ASC';
  const result = await pool.query(query, params);
  return res.json(result.rows);
});

// GET /api/inventory/velocity/report  — must be before /:id
router.get('/velocity/report', authenticate, async (req: AuthRequest, res: Response) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);

  const velocity = await pool.query(
    `SELECT
       si.inventory_id,
       i.name, i.sku, i.category,
       i.quantity as current_stock,
       i.low_stock_threshold,
       SUM(si.quantity) as sold_14d,
       ROUND(CAST(SUM(si.quantity) AS NUMERIC) / 14, 2) as daily_velocity
     FROM sale_items si
     JOIN inventory i ON si.inventory_id = i.id
     JOIN sales s ON si.sale_id = s.id
     WHERE s.created_at >= $1
     GROUP BY si.inventory_id, i.name, i.sku, i.category, i.quantity, i.low_stock_threshold
     ORDER BY daily_velocity DESC`,
    [cutoff.toISOString()]
  );

  const allItems = (await pool.query('SELECT * FROM inventory ORDER BY name')).rows;
  const velocityMap = new Map(velocity.rows.map((v: any) => [v.inventory_id, v]));

  const enriched = allItems.map((item: any) => {
    const v = velocityMap.get(item.id);
    if (v) {
      const daysRemaining = v.daily_velocity > 0 ? Math.floor(item.quantity / v.daily_velocity) : 999;
      return { ...v, days_remaining: daysRemaining, alert_level: daysRemaining < 3 ? 'red' : daysRemaining < 7 ? 'amber' : 'ok' };
    }
    return {
      inventory_id: item.id, name: item.name, sku: item.sku, category: item.category,
      current_stock: item.quantity, low_stock_threshold: item.low_stock_threshold,
      sold_14d: 0, daily_velocity: 0,
      days_remaining: item.quantity > 0 ? 999 : 0,
      alert_level: item.quantity <= item.low_stock_threshold ? 'amber' : 'ok',
    };
  });

  return res.json(enriched);
});

// GET /api/inventory/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const result = await pool.query('SELECT * FROM inventory WHERE id = $1', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Item not found' });
  return res.json(result.rows[0]);
});

// POST /api/inventory
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { name, sku, category, quantity, cost_price, sell_price, low_stock_threshold } = req.body;

  if (!name || !sku || !category) {
    return res.status(400).json({ error: 'Name, SKU, and category are required' });
  }

  const existing = await pool.query('SELECT id FROM inventory WHERE sku = $1', [sku]);
  if (existing.rows[0]) {
    return res.status(400).json({ error: 'SKU already exists' });
  }

  const result = await pool.query(
    `INSERT INTO inventory (name, sku, category, quantity, cost_price, sell_price, low_stock_threshold)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [name, sku, category, quantity || 0, cost_price || 0, sell_price || 0, low_stock_threshold || 5]
  );

  const item = (await pool.query('SELECT * FROM inventory WHERE id = $1', [result.rows[0].id])).rows[0];
  return res.status(201).json(item);
});

// PUT /api/inventory/:id
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { name, sku, category, quantity, cost_price, sell_price, low_stock_threshold } = req.body;

  const check = await pool.query('SELECT * FROM inventory WHERE id = $1', [req.params.id]);
  const item = check.rows[0];
  if (!item) return res.status(404).json({ error: 'Item not found' });

  await pool.query(
    `UPDATE inventory SET name=$1, sku=$2, category=$3, quantity=$4, cost_price=$5, sell_price=$6, low_stock_threshold=$7, updated_at=NOW() WHERE id=$8`,
    [
      name ?? item.name, sku ?? item.sku, category ?? item.category,
      quantity ?? item.quantity, cost_price ?? item.cost_price,
      sell_price ?? item.sell_price, low_stock_threshold ?? item.low_stock_threshold,
      req.params.id,
    ]
  );

  const updated = (await pool.query('SELECT * FROM inventory WHERE id = $1', [req.params.id])).rows[0];
  return res.json(updated);
});

// DELETE /api/inventory/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const check = await pool.query('SELECT id FROM inventory WHERE id = $1', [req.params.id]);
  if (!check.rows[0]) return res.status(404).json({ error: 'Item not found' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE sale_items SET inventory_id = NULL WHERE inventory_id = $1', [req.params.id]);
    await client.query('DELETE FROM inventory WHERE id = $1', [req.params.id]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  return res.json({ success: true });
});

// POST /api/inventory/bulk-update
router.post('/bulk-update', authenticate, async (req: AuthRequest, res: Response) => {
  const { updates } = req.body;

  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({ error: 'Updates array is required' });
  }

  const client = await pool.connect();
  const results: any[] = [];
  try {
    await client.query('BEGIN');
    for (const update of updates) {
      const check = await client.query('SELECT * FROM inventory WHERE id = $1', [update.id]);
      const item = check.rows[0];
      if (!item) continue;

      const newQty = item.quantity + (update.quantity_add || 0);
      await client.query(
        `UPDATE inventory SET
           quantity = $1,
           cost_price = COALESCE($2, cost_price),
           sell_price = COALESCE($3, sell_price),
           updated_at = NOW()
         WHERE id = $4`,
        [newQty, update.cost_price || null, update.sell_price || null, update.id]
      );
      const updated = (await client.query('SELECT * FROM inventory WHERE id = $1', [update.id])).rows[0];
      results.push(updated);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  return res.json({ updated: results.length, items: results });
});

export default router;
