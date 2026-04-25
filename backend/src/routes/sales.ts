import { Router, Response } from 'express';
import pool from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const TAX_RATE = 0.13;

// GET /api/sales
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { date, category, payment_mode } = req.query;
  let query = 'SELECT s.*, u.name as created_by_name FROM sales s LEFT JOIN users u ON s.created_by = u.id WHERE 1=1';
  const params: any[] = [];
  let pi = 0;

  if (date)         { query += ` AND DATE(s.created_at) = $${++pi}`;  params.push(date); }
  if (category)     { query += ` AND s.category = $${++pi}`;           params.push(category); }
  if (payment_mode) { query += ` AND s.payment_mode = $${++pi}`;       params.push(payment_mode); }

  query += ' ORDER BY s.created_at DESC';
  const sales = (await pool.query(query, params)).rows;

  const result = await Promise.all(
    sales.map(async (sale: any) => ({
      ...sale,
      sale_items: (await pool.query('SELECT * FROM sale_items WHERE sale_id = $1', [sale.id])).rows,
    }))
  );

  return res.json(result);
});

// GET /api/sales/summary/today  — must be before /:id
router.get('/summary/today', authenticate, async (req: AuthRequest, res: Response) => {
  const today = new Date().toISOString().split('T')[0];

  const summary = (await pool.query(
    `SELECT
       COUNT(*) as transaction_count,
       SUM(total) as total_revenue,
       SUM(CASE WHEN payment_mode = 'Cash'   THEN total ELSE 0 END) as cash_total,
       SUM(CASE WHEN payment_mode = 'Debit'  THEN total ELSE 0 END) as debit_total,
       SUM(CASE WHEN payment_mode = 'Credit' THEN total ELSE 0 END) as credit_total,
       SUM(CASE WHEN category = 'SIM'        THEN total ELSE 0 END) as sim_total,
       SUM(CASE WHEN category = 'Accessory'  THEN total ELSE 0 END) as accessory_total
     FROM sales WHERE DATE(created_at) = $1`,
    [today]
  )).rows[0];

  return res.json(summary || {
    transaction_count: 0, total_revenue: 0, cash_total: 0,
    debit_total: 0, credit_total: 0, sim_total: 0, accessory_total: 0,
  });
});

// GET /api/sales/summary/category  — must be before /:id
router.get('/summary/category', authenticate, async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    `SELECT category, COUNT(*) as count, SUM(total) as total
     FROM sales GROUP BY category ORDER BY total DESC`
  );
  return res.json(result.rows);
});

// GET /api/sales/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    'SELECT s.*, u.name as created_by_name FROM sales s LEFT JOIN users u ON s.created_by = u.id WHERE s.id = $1',
    [req.params.id]
  );
  const sale = result.rows[0];
  if (!sale) return res.status(404).json({ error: 'Sale not found' });

  sale.sale_items = (await pool.query('SELECT * FROM sale_items WHERE sale_id = $1', [sale.id])).rows;
  return res.json(sale);
});

// POST /api/sales
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { items, tax_enabled, payment_mode, overall_discount_type, overall_discount_value } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Sale must have at least one item' });
  }

  if (!['Cash', 'Debit', 'Credit'].includes(payment_mode)) {
    return res.status(400).json({ error: 'Invalid payment mode' });
  }

  // Register must be currently open
  const today = new Date().toISOString().split('T')[0];
  const lastOpenRes  = await pool.query(`SELECT created_at FROM open_register_sessions WHERE date = $1 ORDER BY created_at DESC LIMIT 1`, [today]);
  const lastCloseRes = await pool.query(`SELECT created_at FROM close_wizard_sessions  WHERE date = $1 ORDER BY created_at DESC LIMIT 1`, [today]);
  const lastOpen  = lastOpenRes.rows[0];
  const lastClose = lastCloseRes.rows[0];
  const isCurrentlyOpen = lastOpen && (!lastClose || new Date(lastOpen.created_at) > new Date(lastClose.created_at));
  if (!isCurrentlyOpen) {
    return res.status(400).json({ error: 'Register is not open. Please open the register before processing sales.' });
  }

  // Calculate line totals
  let subtotal = 0;
  const processedItems = items.map((item: any) => {
    let lineTotal = item.quantity * item.unit_price;
    let discountAmt = item.discount_type === 'percent'
      ? lineTotal * (item.discount_value / 100)
      : (item.discount_value || 0);
    lineTotal -= discountAmt;
    subtotal += lineTotal;
    return { ...item, line_total: lineTotal, discount_amount: discountAmt };
  });

  let overallDiscount = 0;
  if (overall_discount_type === 'percent') {
    overallDiscount = subtotal * (overall_discount_value / 100);
  } else if (overall_discount_value > 0) {
    overallDiscount = overall_discount_value;
  }

  const discountedSubtotal = subtotal - overallDiscount;
  const taxAmount = tax_enabled ? discountedSubtotal * TAX_RATE : 0;
  const total = discountedSubtotal + taxAmount;

  const categories = processedItems.map((i: any) => i.category || 'Accessory');
  const primaryCategory = categories.includes('SIM') ? 'SIM' : categories[0] || 'Accessory';

  const client = await pool.connect();
  let saleId: number;
  try {
    await client.query('BEGIN');

    const saleResult = await client.query(
      `INSERT INTO sales (items, subtotal, discount_amount, tax_enabled, tax_amount, total, payment_mode, category, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [JSON.stringify(processedItems), subtotal, overallDiscount, tax_enabled ? 1 : 0, taxAmount, total, payment_mode, primaryCategory, req.user!.id]
    );
    saleId = saleResult.rows[0].id;

    for (const item of processedItems) {
      await client.query(
        `INSERT INTO sale_items (sale_id, inventory_id, name, quantity, unit_price, discount_type, discount_value, line_total, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [saleId, item.inventory_id || null, item.name, item.quantity, item.unit_price,
         item.discount_type || 'amount', item.discount_value || 0, item.line_total, item.category || 'Accessory']
      );

      if (item.inventory_id) {
        await client.query(
          `UPDATE inventory SET quantity = GREATEST(0, quantity - $1), updated_at = NOW() WHERE id = $2`,
          [item.quantity, item.inventory_id]
        );
      }
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  const sale = (await pool.query('SELECT * FROM sales WHERE id = $1', [saleId!])).rows[0];
  sale.sale_items = (await pool.query('SELECT * FROM sale_items WHERE sale_id = $1', [saleId!])).rows;
  return res.status(201).json(sale);
});

export default router;
