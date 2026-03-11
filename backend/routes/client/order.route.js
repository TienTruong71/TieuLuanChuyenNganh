import express from 'express'
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from '../../controllers/client/order.controller.js'
import { protect } from '../../middleware/authMiddleware.js'

const router = express.Router()


router.post('/', protect, createOrder)

router.get('/', protect, getMyOrders)

router.get('/:id', protect, getOrderById)

router.put('/:id/cancel', protect, cancelOrder)

export default router