import { Router, Response } from 'express';
import pool from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/vouchers
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { carrier, status } = req.query;
  let query = 'SELECT v.*, u.name as created_by_name FROM vouchers v LEFT JOIN users u ON v.created_by = u.id WHERE 1=1';
  const params: any[] = [];
  let pi = 0;

  if (carrier) { query += ` AND v.carrier = $${++pi}`; params.push(carrier); }
  if (status)  { query += ` AND v.status = $${++pi}`;  params.push(status);  }

  query += ' ORDER BY v.created_at DESC';
  const result = await pool.query(query, params);
  return res.json(result.rows);
});

// POST /api/vouchers - create new voucher sale
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { carrier, amount, customer_phone, sold_at, cost_price, status } = req.body;

  if (!carrier || !amount || !customer_phone || !sold_at) {
    return res.status(400).json({ error: 'Carrier, amount, customer phone, and sold price are required' });
  }

  const result = await pool.query(
    `INSERT INTO vouchers (carrier, amount, customer_phone, sold_at, cost_price, status, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [carrier, amount, customer_phone, sold_at, cost_price || 0, status || 'Sold', req.user!.id]
  );

  const voucher = (await pool.query('SELECT * FROM vouchers WHERE id = $1', [result.rows[0].id])).rows[0];
  return res.status(201).json(voucher);
});

// PATCH /api/vouchers/:id/status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const valid = ['Sold', 'Pending', 'Failed'];

  if (!valid.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const check = await pool.query('SELECT id FROM vouchers WHERE id = $1', [req.params.id]);
  if (!check.rows[0]) return res.status(404).json({ error: 'Voucher not found' });

  await pool.query('UPDATE vouchers SET status = $1 WHERE id = $2', [status, req.params.id]);
  const updated = (await pool.query('SELECT * FROM vouchers WHERE id = $1', [req.params.id])).rows[0];
  return res.json(updated);
});

// DELETE /api/vouchers/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const check = await pool.query('SELECT id FROM vouchers WHERE id = $1', [req.params.id]);
  if (!check.rows[0]) return res.status(404).json({ error: 'Voucher not found' });
  await pool.query('DELETE FROM vouchers WHERE id = $1', [req.params.id]);
  return res.json({ success: true });
});

// GET /api/vouchers/summary/carriers
router.get('/summary/carriers', authenticate, async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    `SELECT carrier, COUNT(*) as count, SUM(amount) as total_face_value, SUM(sold_at) as total_revenue
     FROM vouchers GROUP BY carrier ORDER BY total_revenue DESC`
  );
  return res.json(result.rows);
});

// GET /api/vouchers/open-register/history
router.get('/open-register/history', authenticate, async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    `SELECT r.*, u.name as created_by_name FROM open_register_sessions r
     LEFT JOIN users u ON r.created_by = u.id ORDER BY r.created_at DESC LIMIT 30`
  );
  return res.json(result.rows);
});

export default router;
