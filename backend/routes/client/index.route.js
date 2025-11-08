import express from 'express';
import orderRoutes from './order.route.js';

const router = express.Router();

// Map các route con
router.use('/orders', orderRoutes);

export default router;
