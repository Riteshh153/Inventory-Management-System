import { Router } from 'express';
import {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, listCustomers);
router.get('/:id', optionalAuth, getCustomerById);
router.post('/', optionalAuth, createCustomer);
router.put('/:id', optionalAuth, updateCustomer);
router.delete('/:id', optionalAuth, deleteCustomer);

export default router;
