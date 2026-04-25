import { Router, Response } from 'express';
import pool from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const FLOAT_AMOUNT = 200;

// GET /api/close-wizard/today-sales
router.get('/today-sales', authenticate, async (req: AuthRequest, res: Response) => {
  const today = new Date().toISOString().split('T')[0];

  const summary = (await pool.query(
    `SELECT
       COALESCE(SUM(total), 0) as total_sales,
       COALESCE(SUM(CASE WHEN payment_mode = 'Cash'   THEN total ELSE 0 END), 0) as cash_sales,
       COALESCE(SUM(CASE WHEN payment_mode = 'Debit'  THEN total ELSE 0 END), 0) as debit_sales,
       COALESCE(SUM(CASE WHEN payment_mode = 'Credit' THEN total ELSE 0 END), 0) as credit_sales,
       COUNT(*) as transaction_count
     FROM sales WHERE DATE(created_at) = $1`,
    [today]
  )).rows[0];

  const openingFloatRes = await pool.query(
    `SELECT float_counted FROM open_register_sessions WHERE DATE(created_at) = $1 ORDER BY created_at DESC LIMIT 1`,
    [today]
  );
  const openFloat = openingFloatRes.rows[0] ? parseFloat(openingFloatRes.rows[0].float_counted) : FLOAT_AMOUNT;
  const expectedCash = openFloat + parseFloat(summary?.cash_sales || 0);

  return res.json({
    ...summary,
    opening_float: openFloat,
    expected_cash: expectedCash,
    float_to_remove: FLOAT_AMOUNT,
    expected_deposit: Math.max(0, expectedCash - FLOAT_AMOUNT),
  });
});

// POST /api/close-wizard/submit
router.post('/submit', authenticate, async (req: AuthRequest, res: Response) => {
  const today = new Date().toISOString().split('T')[0];

  const lastOpenRes  = await pool.query(`SELECT created_at FROM open_register_sessions WHERE date = $1 ORDER BY created_at DESC LIMIT 1`, [today]);
  const lastCloseRes = await pool.query(`SELECT created_at FROM close_wizard_sessions  WHERE date = $1 ORDER BY created_at DESC LIMIT 1`, [today]);
  const lastOpen  = lastOpenRes.rows[0];
  const lastClose = lastCloseRes.rows[0];
  const isCurrentlyOpen = lastOpen && (!lastClose || new Date(lastOpen.created_at) > new Date(lastClose.created_at));

  if (!isCurrentlyOpen) {
    return res.status(400).json({ error: 'Register is not currently open. Please open the register before closing.' });
  }

  const { cash_counted, notes, denominations } = req.body;

  const summary = (await pool.query(
    `SELECT COALESCE(SUM(CASE WHEN payment_mode = 'Cash' THEN total ELSE 0 END), 0) as cash_sales
     FROM sales WHERE DATE(created_at) = $1`,
    [today]
  )).rows[0];

  const openingFloatRes = await pool.query(
    `SELECT float_counted FROM open_register_sessions WHERE DATE(created_at) = $1 ORDER BY created_at DESC LIMIT 1`,
    [today]
  );
  const openFloat = openingFloatRes.rows[0] ? parseFloat(openingFloatRes.rows[0].float_counted) : FLOAT_AMOUNT;
  const expectedCash = openFloat + parseFloat(summary?.cash_sales || 0);
  const variance = (cash_counted || 0) - expectedCash;
  const depositAmount = Math.max(0, (cash_counted || 0) - FLOAT_AMOUNT);

  const result = await pool.query(
    `INSERT INTO close_wizard_sessions
       (date, cash_counted, expected_cash, float_removed, deposit_amount, variance, notes, denominations, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [today, cash_counted || 0, expectedCash, FLOAT_AMOUNT, depositAmount, variance,
     notes || null, denominations ? JSON.stringify(denominations) : null, req.user!.id]
  );

  const session = (await pool.query('SELECT * FROM close_wizard_sessions WHERE id = $1', [result.rows[0].id])).rows[0];
  return res.status(201).json(session);
});

// GET /api/close-wizard/history
router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    `SELECT c.*, u.name as created_by_name FROM close_wizard_sessions c
     LEFT JOIN users u ON c.created_by = u.id ORDER BY c.created_at DESC LIMIT 30`
  );
  return res.json(result.rows);
});

export default router;
