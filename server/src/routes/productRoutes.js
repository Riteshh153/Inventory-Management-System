import { Router } from 'express';
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getLowStockProducts,
  getOutOfStockProducts,
  getProductMovements
} from '../controllers/productController.js';
import { optionalAuth, authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, listProducts);
router.get('/low-stock', optionalAuth, getLowStockProducts);
router.get('/out-of-stock', optionalAuth, getOutOfStockProducts);
router.get('/:id', optionalAuth, getProductById);
router.get('/:id/movements', optionalAuth, getProductMovements);

// Write operations (Authenticated)
router.post('/', optionalAuth, createProduct);
router.put('/:id', optionalAuth, updateProduct);
router.patch('/:id/status', optionalAuth, updateProduct);
router.delete('/:id', optionalAuth, deleteProduct);
router.post('/:id/adjust-stock', optionalAuth, adjustStock);

export default router;
