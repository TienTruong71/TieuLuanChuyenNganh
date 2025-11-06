// backend/routes/admin/customer.routes.js
import express from 'express'
import {
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
} from '../../controllers/admin/customer.controller.js'
import { protect, admin } from '../../middleware/authMiddleware.js'

const router = express.Router()

// Bảo vệ tất cả route bằng admin
router.use(protect, admin)

router.route('/')
    .get(getCustomers)

router.route('/:id')
    .get(getCustomerById)
    .put(updateCustomer)
    .delete(deleteCustomer)

export default router