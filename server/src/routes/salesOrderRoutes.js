import { Router } from 'express';
import {
  listSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  cancelSalesOrder
} from '../controllers/salesOrderController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, listSalesOrders);
router.get('/:id', optionalAuth, getSalesOrderById);
router.post('/', optionalAuth, createSalesOrder);
router.post('/:id/cancel', optionalAuth, cancelSalesOrder);

export default router;
