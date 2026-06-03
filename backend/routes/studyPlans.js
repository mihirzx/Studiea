import { Router } from 'express';
import * as studyPlanController from '../controllers/studyPlanController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { requireInternalSecret } from '../middleware/internalAuth.js';
import { chatLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/generate', requireInternalSecret, studyPlanController.generate); // Grader only
router.post('/chat', requireAuth, requireRole('student'), chatLimiter, studyPlanController.chat);
router.get('/history/:student_id', requireAuth, requireRole('teacher'), studyPlanController.history);
router.get('/chat/:student_id', requireAuth, requireRole('student'), studyPlanController.chatHistory); // own only
router.get('/student/:student_id', requireAuth, studyPlanController.getActivePlan); // student (own) or teacher (plan only)

export default router;
