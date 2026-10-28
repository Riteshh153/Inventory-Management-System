import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getSettings);
router.put('/', optionalAuth, updateSettings);

export default router;
