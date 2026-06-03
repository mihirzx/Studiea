import { Router } from 'express';
import * as submissionController from '../controllers/submissionController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/submit', requireAuth, requireRole('student'), aiLimiter, submissionController.submit);
router.get('/student/:student_id', requireAuth, submissionController.listByStudent); // student (own) or teacher
router.get('/assignment/:assignment_id', requireAuth, requireRole('teacher'), submissionController.listByAssignment);
router.get('/pending-alerts/:teacher_id', requireAuth, requireRole('teacher'), submissionController.pendingAlerts);
router.patch('/:id/approve', requireAuth, requireRole('teacher'), submissionController.approveSubmission);
router.get('/:id', requireAuth, submissionController.getById); // teacher or student (own) — checked in controller

export default router;
