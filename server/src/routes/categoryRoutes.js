import { Router } from 'express';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, listCategories);
router.post('/', optionalAuth, createCategory);
router.put('/:id', optionalAuth, updateCategory);
router.delete('/:id', optionalAuth, deleteCategory);

export default router;
