// backend/routes/admin/order.route.js
import express from 'express'
import {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
} from '../../controllers/admin/order.controller.js'
import { protect, admin } from '../../middleware/authMiddleware.js'

const router = express.Router()

// Bảo vệ tất cả route bằng admin
router.use(protect, admin)

router.route('/')
    .get(getOrders)       // GET /api/admin/orders
    .post(createOrder)    // POST /api/admin/orders

router.route('/:id')
    .get(getOrderById)    // GET /api/admin/orders/:id
    .put(updateOrder)     // PUT /api/admin/orders/:id
    .delete(deleteOrder)  // DELETE /api/admin/orders/:id

export default router