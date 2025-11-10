import express from 'express'
import {
  getRevenueReports,
  exportRevenueReportPDF,
  createRevenueReport,
} from '../../controllers/admin/revenuereport.controller.js'
import { protect, admin } from '../../middleware/authMiddleware.js'

const router = express.Router()

// Manager xem danh sách và lọc báo cáo doanh thu
router.get('/', protect, admin, getRevenueReports)

// Manager xuất báo cáo PDF
router.get('/pdf', protect, admin, exportRevenueReportPDF)

router.post('/create', protect, admin, createRevenueReport)

export default router
