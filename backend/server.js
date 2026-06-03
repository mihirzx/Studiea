import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import teacherRoutes from './routes/teacher.js';
import sessionRoutes from './routes/sessions.js';
import assignmentRoutes from './routes/assignments.js';
import submissionRoutes from './routes/submissions.js';
import studyPlanRoutes from './routes/studyPlans.js';
import progressRoutes from './routes/progress.js';

const app = express();

// --- Security middleware (must come before routes) ---
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL          // frontend Cloud Run URL in prod
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(mongoSanitize()); // strips $ and . from req.body, req.params, req.query
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- Health check ---
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'studiea-backend' }));

// --- Routers ---
app.use('/auth', authRoutes);
app.use('/teacher', teacherRoutes);
app.use('/sessions', sessionRoutes);
app.use('/assignments', assignmentRoutes);
app.use('/submissions', submissionRoutes);
app.use('/study-plans', studyPlanRoutes);
app.use('/progress', progressRoutes);

// --- Global error handler (must be last) ---
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Studiea backend listening on :${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

export default app;
