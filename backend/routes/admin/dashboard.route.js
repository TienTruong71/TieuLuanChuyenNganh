// backend/routes/admin/dashboard.route.js
import express from 'express'
import {
    getDashboardStats,
    getRevenueReport,
    getTopProducts,
} from '../../controllers/admin/dashboard.controller.js'
import { protect, admin } from '../../middleware/authMiddleware.js'

const router = express.Router()

// Bảo vệ tất cả route bằng admin
router.use(protect, admin)

router.get('/', getDashboardStats)              // GET /api/admin/dashboard
router.get('/revenue-report', getRevenueReport) // GET /api/admin/dashboard/revenue-report
router.get('/top-products', getTopProducts)     // GET /api/admin/dashboard/top-products

export default router