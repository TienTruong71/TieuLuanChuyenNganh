import express from 'express';
import { createSupportRequest } from '../../controllers/client/support.controller.js';
import { protect } from '../../middleware/authMiddleware.js'; // middleware kiểm tra đăng nhập

const router = express.Router();

// POST gửi yêu cầu hỗ trợ
router.post('/', protect, createSupportRequest);

export default router;
