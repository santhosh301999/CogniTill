import { Router, Response } from 'express';
import pool from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/reports/register-status
router.get('/register-status', authenticate, async (req: AuthRequest, res: Response) => {
  const today = new Date().toISOString().split('T')[0];
  const openSession  = (await pool.query(`SELECT * FROM open_register_sessions WHERE date = $1 ORDER BY created_at DESC LIMIT 1`, [today])).rows[0] || null;
  const closeSession = (await pool.query(`SELECT * FROM close_wizard_sessions  WHERE date = $1 ORDER BY created_at DESC LIMIT 1`, [today])).rows[0] || null;

  const isOpen   = !!openSession && (!closeSession || new Date(openSession.created_at) > new Date(closeSession.created_at));
  const isClosed = !!closeSession && (!openSession || new Date(closeSession.created_at) >= new Date(openSession.created_at));

  return res.json({ is_open: isOpen, is_closed: isClosed, open_session: openSession, close_session: closeSession });
});

// GET /api/reports/eod
router.get('/eod', authenticate, async (req: AuthRequest, res: Response) => {
  const { date } = req.query;
  const reportDate = (date as string) || new Date().toISOString().split('T')[0];

  const [salesSummary, repairsSummary, vouchersSummary, inventoryAlerts, closeSession, openSession, topItems] = await Promise.all([
    pool.query(
      `SELECT COUNT(*) as transaction_count,
         COALESCE(SUM(total), 0) as total_revenue,
         COALESCE(SUM(CASE WHEN payment_mode = 'Cash'   THEN total ELSE 0 END), 0) as cash_sales,
         COALESCE(SUM(CASE WHEN payment_mode = 'Debit'  THEN total ELSE 0 END), 0) as debit_sales,
         COALESCE(SUM(CASE WHEN payment_mode = 'Credit' THEN total ELSE 0 END), 0) as credit_sales,
         COALESCE(SUM(CASE WHEN category = 'SIM'        THEN total ELSE 0 END), 0) as sim_revenue,
         COALESCE(SUM(CASE WHEN category = 'Accessory'  THEN total ELSE 0 END), 0) as accessory_revenue
       FROM sales WHERE DATE(created_at) = $1`, [reportDate]),

    pool.query(
      `SELECT COUNT(*) as total_repairs,
         SUM(CASE WHEN status = 'Complete'    THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN status = 'Collected'   THEN 1 ELSE 0 END) as collected,
         SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
         SUM(CASE WHEN status = 'Received'    THEN 1 ELSE 0 END) as received
       FROM repairs WHERE DATE(created_at) = $1`, [reportDate]),

    pool.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(sold_at), 0) as revenue
       FROM vouchers WHERE DATE(created_at) = $1`, [reportDate]),

    pool.query(
      `SELECT name, sku, quantity, low_stock_threshold
       FROM inventory WHERE quantity <= low_stock_threshold ORDER BY quantity ASC LIMIT 10`),

    pool.query(`SELECT * FROM close_wizard_sessions WHERE date = $1 ORDER BY created_at DESC LIMIT 1`, [reportDate]),
    pool.query(`SELECT * FROM open_register_sessions WHERE date = $1 ORDER BY created_at DESC LIMIT 1`, [reportDate]),

    pool.query(
      `SELECT si.name, SUM(si.quantity) as units_sold, SUM(si.line_total) as revenue
       FROM sale_items si JOIN sales s ON si.sale_id = s.id
       WHERE DATE(s.created_at) = $1
       GROUP BY si.name ORDER BY revenue DESC LIMIT 5`, [reportDate]),
  ]);

  return res.json({
    date: reportDate,
    sales: salesSummary.rows[0],
    repairs: repairsSummary.rows[0],
    vouchers: vouchersSummary.rows[0],
    inventory_alerts: inventoryAlerts.rows,
    close_session: closeSession.rows[0] || null,
    open_session: openSession.rows[0] || null,
    top_items: topItems.rows,
    generated_at: new Date().toISOString(),
  });
});

// GET /api/reports/eod/history
router.get('/eod/history', authenticate, async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    `SELECT e.*, u.name as created_by_name FROM eod_reports e
     LEFT JOIN users u ON e.created_by = u.id ORDER BY e.date DESC LIMIT 30`
  );
  return res.json(result.rows);
});

// POST /api/reports/eod
router.post('/eod', authenticate, async (req: AuthRequest, res: Response) => {
  const { date, total_sales, total_transactions, repairs_completed, inventory_alerts, summary } = req.body;
  const result = await pool.query(
    `INSERT INTO eod_reports (date, total_sales, total_transactions, repairs_completed, inventory_alerts, summary, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [date || new Date().toISOString().split('T')[0], total_sales || 0, total_transactions || 0,
     repairs_completed || 0, inventory_alerts ? JSON.stringify(inventory_alerts) : null,
     summary || null, req.user!.id]
  );
  const report = (await pool.query('SELECT * FROM eod_reports WHERE id = $1', [result.rows[0].id])).rows[0];
  return res.status(201).json(report);
});

// GET /api/reports/monthly
router.get('/monthly', authenticate, async (req: AuthRequest, res: Response) => {
  const year  = parseInt(req.query.year  as string) || new Date().getFullYear();
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate   = new Date(year, month, 0).toISOString().split('T')[0]; // last day of month

  // Previous month bounds
  const prevDate  = new Date(year, month - 2, 1);
  const prevYear  = prevDate.getFullYear();
  const prevMonth = prevDate.getMonth() + 1;
  const prevStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
  const prevEnd   = new Date(prevYear, prevMonth, 0).toISOString().split('T')[0];

  const [summary, prevSummary, daily, topItems, categoryBreakdown, repairStats] = await Promise.all([
    pool.query(
      `SELECT
         COUNT(*)                                                                  AS transaction_count,
         COALESCE(SUM(total), 0)                                                   AS total_revenue,
         COALESCE(SUM(CASE WHEN payment_mode = 'Cash'   THEN total ELSE 0 END), 0) AS cash_sales,
         COALESCE(SUM(CASE WHEN payment_mode = 'Debit'  THEN total ELSE 0 END), 0) AS debit_sales,
         COALESCE(SUM(CASE WHEN payment_mode = 'Credit' THEN total ELSE 0 END), 0) AS credit_sales,
         COALESCE(AVG(total), 0)                                                   AS avg_transaction
       FROM sales WHERE DATE(created_at) BETWEEN $1 AND $2`,
      [startDate, endDate]
    ),

    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total_revenue, COUNT(*) AS transaction_count
       FROM sales WHERE DATE(created_at) BETWEEN $1 AND $2`,
      [prevStart, prevEnd]
    ),

    pool.query(
      `SELECT DATE(created_at) AS day,
              COALESCE(SUM(total), 0)  AS revenue,
              COUNT(*)                 AS transactions
       FROM sales WHERE DATE(created_at) BETWEEN $1 AND $2
       GROUP BY day ORDER BY day ASC`,
      [startDate, endDate]
    ),

    pool.query(
      `SELECT si.name, SUM(si.quantity) AS units_sold, SUM(si.line_total) AS revenue
       FROM sale_items si JOIN sales s ON si.sale_id = s.id
       WHERE DATE(s.created_at) BETWEEN $1 AND $2
       GROUP BY si.name ORDER BY revenue DESC LIMIT 10`,
      [startDate, endDate]
    ),

    pool.query(
      `SELECT category, COUNT(*) AS transactions, COALESCE(SUM(total), 0) AS total
       FROM sales WHERE DATE(created_at) BETWEEN $1 AND $2
       GROUP BY category ORDER BY total DESC`,
      [startDate, endDate]
    ),

    pool.query(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN status = 'Complete'    THEN 1 ELSE 0 END) AS completed,
              SUM(CASE WHEN status = 'Collected'   THEN 1 ELSE 0 END) AS collected,
              SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
              SUM(CASE WHEN status = 'Received'    THEN 1 ELSE 0 END) AS received
       FROM repairs WHERE DATE(created_at) BETWEEN $1 AND $2`,
      [startDate, endDate]
    ),
  ]);

  return res.json({
    year,
    month,
    start_date: startDate,
    end_date: endDate,
    summary: summary.rows[0],
    prev_summary: prevSummary.rows[0],
    daily: daily.rows,
    top_items: topItems.rows,
    category_breakdown: categoryBreakdown.rows,
    repairs: repairStats.rows[0],
  });
});

// GET /api/reports/sales-by-category
router.get('/sales-by-category', authenticate, async (req: AuthRequest, res: Response) => {
  const { start_date, end_date } = req.query;
  let query = `SELECT category, COUNT(*) as transactions, SUM(total) as total FROM sales WHERE 1=1`;
  const params: any[] = [];
  let pi = 0;

  if (start_date) { query += ` AND DATE(created_at) >= $${++pi}`; params.push(start_date); }
  if (end_date)   { query += ` AND DATE(created_at) <= $${++pi}`; params.push(end_date); }
  query += ' GROUP BY category ORDER BY total DESC';

  const result = await pool.query(query, params);
  return res.json(result.rows);
});

// POST /api/reports/open-register
router.post('/open-register', authenticate, async (req: AuthRequest, res: Response) => {
  const today = new Date().toISOString().split('T')[0];

  const lastOpenRes  = await pool.query(`SELECT created_at FROM open_register_sessions WHERE date = $1 ORDER BY created_at DESC LIMIT 1`, [today]);
  const lastCloseRes = await pool.query(`SELECT created_at FROM close_wizard_sessions  WHERE date = $1 ORDER BY created_at DESC LIMIT 1`, [today]);
  const lastOpen  = lastOpenRes.rows[0];
  const lastClose = lastCloseRes.rows[0];
  const isCurrentlyOpen = lastOpen && (!lastClose || new Date(lastOpen.created_at) > new Date(lastClose.created_at));

  if (isCurrentlyOpen) {
    return res.status(400).json({ error: 'Register is already open.' });
  }

  const { float_counted, notes, denominations } = req.body;
  const FLOAT_TARGET = 200;
  const shortage = Math.max(0, FLOAT_TARGET - (float_counted || 0));

  const result = await pool.query(
    `INSERT INTO open_register_sessions (date, float_target, float_counted, shortage, notes, denominations, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [today, FLOAT_TARGET, float_counted || 0, shortage, notes || null,
     denominations ? JSON.stringify(denominations) : null, req.user!.id]
  );

  const session = (await pool.query('SELECT * FROM open_register_sessions WHERE id = $1', [result.rows[0].id])).rows[0];
  return res.status(201).json(session);
});

// GET /api/reports/open-register/today
router.get('/open-register/today', authenticate, async (req: AuthRequest, res: Response) => {
  const today = new Date().toISOString().split('T')[0];
  const result = await pool.query(
    `SELECT r.*, u.name as created_by_name FROM open_register_sessions r
     LEFT JOIN users u ON r.created_by = u.id WHERE r.date = $1 ORDER BY r.created_at DESC LIMIT 1`,
    [today]
  );
  return res.json(result.rows[0] || null);
});

export default router;
