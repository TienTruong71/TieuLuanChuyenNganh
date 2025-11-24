import express from 'express';
import {
  getAllSupportRequests,
  getSupportRequestById,
  replyAndResolveSupportRequest
} from '../../../controllers/staff/sale/support.controller.js';
import { staff} from '../../../middleware/authMiddleware.js'; // middleware auth Sale Staff

const router = express.Router();

// Bắt buộc đăng nhập
router.use(staff);

// Lấy danh sách yêu cầu
router.get('/', getAllSupportRequests);

// Lấy chi tiết yêu cầu
router.get('/:id', getSupportRequestById);

// Trả lời và đóng yêu cầu
router.put('/:id/reply', replyAndResolveSupportRequest);

export default router;
