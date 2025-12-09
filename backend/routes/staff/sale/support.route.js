import express from 'express';
import {
  getAllSupportRequests,
  getSupportRequestById,
  replyAndResolveSupportRequest
} from '../../../controllers/staff/sale/support.controller.js';
import { protect, saleStaff } from '../../../middleware/authMiddleware.js';

const router = express.Router();

// Bắt buộc đăng nhập
router.use(protect);
router.use(saleStaff);

// Lấy danh sách yêu cầu 
router.get('/', getAllSupportRequests);

// Lấy chi tiết yêu cầu
router.get('/:id', getSupportRequestById);

// Trả lời và đóng yêu cầu
router.put('/:id/reply', replyAndResolveSupportRequest);

export default router;
