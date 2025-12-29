import express from 'express';
import {
  getAllFeedbacks,
  getFeedbackById,
  approveFeedback,
  deleteFeedback,
} from '../../../controllers/staff/sale/feedback.controller.js';
import { protect, saleStaff, admin } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(saleStaff);


router.get('/', getAllFeedbacks);
router.get('/:id', getFeedbackById);
router.put('/:id/approve', approveFeedback);
router.delete('/:id', deleteFeedback);

export default router;
