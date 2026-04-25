import { Router, Response } from 'express';
import pool from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function sendSMS(phone: string, message: string) {
  console.log(`[SMS] To: ${phone} | Message: ${message}`);
}

// GET /api/repairs
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { search, status } = req.query;
  let query = 'SELECT r.*, u.name as created_by_name FROM repairs r LEFT JOIN users u ON r.created_by = u.id WHERE 1=1';
  const params: any[] = [];
  let pi = 0;

  if (search) {
    const s = `%${search}%`;
    query += ` AND (r.customer_name ILIKE $${++pi} OR r.customer_phone ILIKE $${++pi} OR r.device_model ILIKE $${++pi} OR r.pickup_pin ILIKE $${++pi})`;
    params.push(s, s, s, s);
  }
  if (status) {
    query += ` AND r.status = $${++pi}`;
    params.push(status);
  }

  query += ' ORDER BY r.created_at DESC';
  const result = await pool.query(query, params);
  return res.json(result.rows);
});

// GET /api/repairs/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    'SELECT r.*, u.name as created_by_name FROM repairs r LEFT JOIN users u ON r.created_by = u.id WHERE r.id = $1',
    [req.params.id]
  );
  const repair = result.rows[0];
  if (!repair) return res.status(404).json({ error: 'Repair not found' });
  return res.json(repair);
});

// GET /api/repairs/pin/:pin
router.get('/pin/:pin', authenticate, async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    'SELECT r.*, u.name as created_by_name FROM repairs r LEFT JOIN users u ON r.created_by = u.id WHERE r.pickup_pin = $1',
    [req.params.pin]
  );
  const repair = result.rows[0];
  if (!repair) return res.status(404).json({ error: 'No repair found with this PIN' });
  return res.json(repair);
});

// POST /api/repairs
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { customer_name, customer_phone, device_model, issue_description, quoted_price } = req.body;

  if (!customer_name || !customer_phone || !device_model || !issue_description || quoted_price === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const pickup_pin = generatePin();

  const result = await pool.query(
    `INSERT INTO repairs (customer_name, customer_phone, device_model, issue_description, quoted_price, pickup_pin, status, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, 'Received', $7) RETURNING id`,
    [customer_name, customer_phone, device_model, issue_description, quoted_price, pickup_pin, req.user!.id]
  );

  sendSMS(customer_phone, `Hi ${customer_name}, your ${device_model} has been received for repair. Quoted: $${quoted_price}. Your pickup PIN is: ${pickup_pin}. - CogniTill`);

  const repair = (await pool.query('SELECT * FROM repairs WHERE id = $1', [result.rows[0].id])).rows[0];
  return res.status(201).json(repair);
});

// PATCH /api/repairs/:id/status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const validStatuses = ['Received', 'In Progress', 'Complete', 'Collected'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const check = await pool.query('SELECT * FROM repairs WHERE id = $1', [req.params.id]);
  const repair = check.rows[0];
  if (!repair) return res.status(404).json({ error: 'Repair not found' });

  await pool.query('UPDATE repairs SET status = $1, updated_at = NOW() WHERE id = $2', [status, req.params.id]);

  if (status === 'Complete') {
    sendSMS(repair.customer_phone, `Hi ${repair.customer_name}, your ${repair.device_model} repair is COMPLETE and ready for pickup! Use PIN: ${repair.pickup_pin} to collect. - CogniTill`);
  }

  const updated = (await pool.query('SELECT * FROM repairs WHERE id = $1', [req.params.id])).rows[0];
  return res.json(updated);
});

// PUT /api/repairs/:id
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { customer_name, customer_phone, device_model, issue_description, quoted_price, status } = req.body;

  const check = await pool.query('SELECT * FROM repairs WHERE id = $1', [req.params.id]);
  const repair = check.rows[0];
  if (!repair) return res.status(404).json({ error: 'Repair not found' });

  await pool.query(
    `UPDATE repairs SET customer_name=$1, customer_phone=$2, device_model=$3, issue_description=$4, quoted_price=$5, status=$6, updated_at=NOW() WHERE id=$7`,
    [
      customer_name ?? repair.customer_name,
      customer_phone ?? repair.customer_phone,
      device_model ?? repair.device_model,
      issue_description ?? repair.issue_description,
      quoted_price ?? repair.quoted_price,
      status ?? repair.status,
      req.params.id,
    ]
  );

  const updated = (await pool.query('SELECT * FROM repairs WHERE id = $1', [req.params.id])).rows[0];
  return res.json(updated);
});

// DELETE /api/repairs/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const check = await pool.query('SELECT id FROM repairs WHERE id = $1', [req.params.id]);
  if (!check.rows[0]) return res.status(404).json({ error: 'Repair not found' });
  await pool.query('DELETE FROM repairs WHERE id = $1', [req.params.id]);
  return res.json({ success: true });
});

export default router;
