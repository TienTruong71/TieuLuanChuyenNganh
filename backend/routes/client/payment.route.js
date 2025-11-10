import express from 'express'
import { protect } from '../../middleware/authMiddleware.js'
import {
  createVNPayPayment,
  vnpayReturn,
} from '../../controllers/client/payment.controller.js'

const router = express.Router()

// Tạo URL thanh toán VNPay
router.post('/vnpay', protect, createVNPayPayment)

// Callback sau khi thanh toán
router.get('/vnpay_return', vnpayReturn)

export default router
