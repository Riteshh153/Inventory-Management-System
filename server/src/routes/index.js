import { Router } from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import supplierRoutes from './supplierRoutes.js';
import customerRoutes from './customerRoutes.js';
import purchaseOrderRoutes from './purchaseOrderRoutes.js';
import salesOrderRoutes from './salesOrderRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import reportRoutes from './reportRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import settingsRoutes from './settingsRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/suppliers', supplierRoutes);
apiRouter.use('/customers', customerRoutes);
apiRouter.use('/purchase-orders', purchaseOrderRoutes);
apiRouter.use('/sales-orders', salesOrderRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/settings', settingsRoutes);

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Stockwise Inventory API',
    uptime: process.uptime()
  });
});

export default apiRouter;
