import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import authRoutes from './routes/auth';
import repairsRoutes from './routes/repairs';
import salesRoutes from './routes/sales';
import inventoryRoutes from './routes/inventory';
import closeWizardRoutes from './routes/closeWizard';
import vouchersRoutes from './routes/vouchers';
import aiRoutes from './routes/ai';
import reportsRoutes from './routes/reports';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

// Catalyst Slate / project domains are allowed in addition to the explicit list
const catalystOrigin = /^https:\/\/[a-z0-9-]+(\.development)?\.(onslate\.com|catalystserverless\.com|onslate\.in|catalystserverless\.in)$/;

app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin) || catalystOrigin.test(origin)),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/repairs', repairsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/close-wizard', closeWizardRoutes);
app.use('/api/vouchers', vouchersRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Local dev: start a server. On Catalyst Advanced I/O the function runtime
// imports the app and serves it, so we must not call listen().
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CogniTill Backend running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
