import { Router } from 'express';
import { listNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, listNotifications);
router.patch('/:id/read', optionalAuth, markAsRead);
router.patch('/read-all', optionalAuth, markAllAsRead);

export default router;
