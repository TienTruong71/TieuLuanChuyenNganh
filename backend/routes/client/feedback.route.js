// backend/routes/client/feedback.routes.js
import express from 'express'
import {
    getFeedbacks,
    getFeedbackById,
    createFeedback,
    updateFeedback,
    deleteFeedback,
} from '../../controllers/client/feedback.controller.js'
import { protect, customer } from '../../middleware/authMiddleware.js'

const router = express.Router()

// Bảo vệ tất cả route bằng customer
router.use(protect, customer)

router.route('/')
    .get(getFeedbacks)      // GET /api/client/feedbacks
    .post(createFeedback)   // POST /api/client/feedbacks

router.route('/:id')
    .get(getFeedbackById)   // GET /api/client/feedbacks/:id
    .put(updateFeedback)    // PUT /api/client/feedbacks/:id
    .delete(deleteFeedback) // DELETE /api/client/feedbacks/:id

export default router