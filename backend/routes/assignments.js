import { Router } from 'express';
import * as assignmentController from '../controllers/assignmentController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/generate', requireAuth, requireRole('teacher'), aiLimiter, assignmentController.generate);
router.get('/student/:student_id', requireAuth, requireRole('student'), assignmentController.listByStudent);
router.get('/teacher/:teacher_id', requireAuth, requireRole('teacher'), assignmentController.listByTeacher);
router.patch('/:id', requireAuth, requireRole('teacher'), assignmentController.update);
router.get('/:id', requireAuth, assignmentController.getById); // teacher or student — ownership checked in controller

export default router;
