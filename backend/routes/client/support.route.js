import express from 'express';
import { 
  createSupportRequest, 
  getActiveSupportRequest, 
  closeSupportRequest,
  sendSupportMessage 
} from '../../controllers/client/support.controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// POST tạo yêu cầu hỗ trợ mới
router.post('/', protect, createSupportRequest);

// GET yêu cầu hỗ trợ đang mở
router.get('/active', protect, getActiveSupportRequest);

// POST gửi tin nhắn trong chat
router.post('/:id/message', protect, sendSupportMessage);

// PUT đóng yêu cầu hỗ trợ
router.put('/:id/close', protect, closeSupportRequest);

export default router;
