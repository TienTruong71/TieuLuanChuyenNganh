import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from '../../controllers/client/order.controller.js';
import { protect } from '../../middleware/authMiddleware.js'; // middleware xác thực user

const router = express.Router();

// Tạo đơn hàng
router.post('/', protect, createOrder);

// Xem danh sách đơn hàng của người dùng
router.get('/', getMyOrders);

// Xem chi tiết đơn hàng
router.get('/:id', protect, getOrderById);

// Hủy đơn hàng
router.put('/:id/cancel', protect, cancelOrder);

export default router;
