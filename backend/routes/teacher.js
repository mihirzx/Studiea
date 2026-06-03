import { Router } from 'express';
import * as teacherController from '../controllers/teacherController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('teacher'));

router.get('/:id', teacherController.getProfile);
router.patch('/:id/threshold', teacherController.setThreshold);
router.get('/:id/students', teacherController.listStudents);
router.get('/:id/dashboard', teacherController.getDashboard);

export default router;
