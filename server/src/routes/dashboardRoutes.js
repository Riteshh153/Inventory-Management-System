import { Router } from 'express';
import {
  getDashboardSummary,
  getSalesTrend,
  getCategoryBreakdown,
  getStockAlerts,
  getRecentOrders
} from '../controllers/dashboardController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/summary', optionalAuth, getDashboardSummary);
router.get('/sales-trend', optionalAuth, getSalesTrend);
router.get('/categories-breakdown', optionalAuth, getCategoryBreakdown);
router.get('/stock-alerts', optionalAuth, getStockAlerts);
router.get('/recent-orders', optionalAuth, getRecentOrders);

export default router;
