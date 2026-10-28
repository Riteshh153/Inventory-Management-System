import { Router } from 'express';
import {
  listSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../controllers/supplierController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, listSuppliers);
router.get('/:id', optionalAuth, getSupplierById);
router.post('/', optionalAuth, createSupplier);
router.put('/:id', optionalAuth, updateSupplier);
router.delete('/:id', optionalAuth, deleteSupplier);

export default router;
