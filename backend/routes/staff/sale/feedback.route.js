import express from 'express';
import {
  getAllFeedbacks,
  getFeedbackById,
  approveFeedback,
  deleteFeedback,
} from '../../../controllers/staff/sale/feedback.controller.js';
import { protect, admin, saleStaff } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(saleStaff);
// router.use(admin);


router.get('/', getAllFeedbacks);
router.get('/:id', getFeedbackById);
router.put('/:id/approve', approveFeedback);
router.delete('/:id', deleteFeedback);

export default router;
