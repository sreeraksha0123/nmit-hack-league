import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import authRoutes from './routes/authRoutes';
import hackathonRoutes from './routes/hackathonRoutes';
import registrationRoutes from './routes/registrationRoutes';
import participationRoutes from './routes/participationRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import adminRoutes from './routes/adminRoutes';
import { initializeAdminAccount } from './services/adminSeedService';
import { ensurePostgresRunning } from './postgresService';

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or postman)
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'NMIT Hack League API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    collegeDomain: `@${ENV.COLLEGE_EMAIL_DOMAIN}`,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api', registrationRoutes);
app.use('/api', participationRoutes);
app.use('/api', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Centralized Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[UNHANDLED_SERVER_ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected internal server error occurred.',
  });
});

// Boot Server & Auto-Initialize Administrator
export const server = app.listen(ENV.PORT, async () => {
  console.log(`=======================================================`);
  console.log(`  NMIT Hack League API Server running on port ${ENV.PORT}`);
  console.log(`  Allowed Email Domain: @${ENV.COLLEGE_EMAIL_DOMAIN}`);
  console.log(`  Environment: ${ENV.NODE_ENV}`);
  console.log(`=======================================================`);

  // Ensure database engine is active and admin account exists safely
  await ensurePostgresRunning();
  await initializeAdminAccount();
});

export default app;
