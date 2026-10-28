import { Router } from 'express';
import { login, getMe, register } from '../controllers/authController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', authenticate, requireRole('admin'), register);
router.get('/me', authenticate, getMe);

export default router;
