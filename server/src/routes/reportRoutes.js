import { Router } from 'express';
import { getInventoryReport, exportInventoryCSV } from '../controllers/reportController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/inventory', optionalAuth, getInventoryReport);
router.get('/export/inventory-csv', optionalAuth, exportInventoryCSV);

export default router;
