// backend/routes/admin/staff.routes.js
import express from 'express'
import {
    getStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
} from '../../controllers/admin/staff.controller.js'
import { protect, admin } from '../../middleware/authMiddleware.js'

const router = express.Router()

// Bảo vệ tất cả route bằng admin
router.use(protect, admin)

router.route('/')
    .get(getStaff)       // GET /api/admin/staff
    .post(createStaff)   // POST /api/admin/staff

router.route('/:id')
    .get(getStaffById)   // GET /api/admin/staff/:id
    .put(updateStaff)    // PUT /api/admin/staff/:id
    .delete(deleteStaff) // DELETE /api/admin/staff/:id

export default router