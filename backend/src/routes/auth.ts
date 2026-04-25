import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'cognitill-secret-key-2024',
    { expiresIn: '8h' }
  );

  return res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role, name: user.name },
  });
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
});

export default router;
