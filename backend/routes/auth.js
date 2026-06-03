import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', requireAuth, authController.logout);

export default router;
