import { Router } from 'express';
import * as progressController from '../controllers/progressController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { requireInternalSecret } from '../middleware/internalAuth.js';

const router = Router();

router.get('/class/:teacher_id', requireAuth, requireRole('teacher'), progressController.getClass);
router.patch('/:student_id', requireInternalSecret, progressController.update); // Grader only
router.get('/:student_id', requireAuth, progressController.getByStudent); // teacher or student (own)

export default router;
