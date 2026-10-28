import { Router } from 'express';
import {
  listPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  receivePurchaseOrder
} from '../controllers/purchaseOrderController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, listPurchaseOrders);
router.get('/:id', optionalAuth, getPurchaseOrderById);
router.post('/', optionalAuth, createPurchaseOrder);
router.patch('/:id/status', optionalAuth, updatePurchaseOrderStatus);
router.post('/:id/receive', optionalAuth, receivePurchaseOrder);
router.patch('/:id/receive', optionalAuth, receivePurchaseOrder);

export default router;
