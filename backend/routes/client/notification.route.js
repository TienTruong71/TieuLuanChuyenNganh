import express from 'express';
import {
  getNotifications,
  getNotificationById,
  markAsRead,
} from '../../controllers/client/notification.controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Lấy danh sách thông báo cá nhân
router.get('/', protect, getNotifications);

// Xem chi tiết một thông báo
router.get('/:id', protect, getNotificationById);

// Đánh dấu đã đọc
router.put('/:id/read', protect, markAsRead);

export default router;
