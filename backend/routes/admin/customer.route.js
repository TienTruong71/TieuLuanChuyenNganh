// backend/routes/admin/customer.routes.js
import express from 'express'
import {
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    getOrdersByCustomer,
    getBookingsByCustomer,
} from '../../controllers/admin/customer.controller.js'
import { protect, admin } from '../../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, admin)

router.route('/')
    .get(getCustomers)

router.route('/:id')
    .get(getCustomerById)
    .put(updateCustomer)
    .delete(deleteCustomer)

router.route('/:id/orders')
    .get(getOrdersByCustomer)

router.route('/:id/bookings')
    .get(getBookingsByCustomer)

export default router