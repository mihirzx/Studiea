import { Router } from 'express';
import * as sessionController from '../controllers/sessionController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { audioUpload } from '../middleware/upload.js';

const router = Router();

router.post('/upload', requireAuth, requireRole('teacher'), aiLimiter, audioUpload.single('audio'), sessionController.upload);
router.post('/live', requireAuth, requireRole('teacher'), sessionController.live);
router.get('/teacher/:teacher_id', requireAuth, requireRole('teacher'), sessionController.listByTeacher);
router.get('/:id', requireAuth, requireRole('teacher'), sessionController.getById);

export default router;
