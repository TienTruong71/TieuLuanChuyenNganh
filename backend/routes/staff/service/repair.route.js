// backend/routes/staff/service/repairProgress.routes.js
import express from 'express'
import {
    getRepairProgresses,
    getRepairProgressById,
    createRepairProgress,
    updateRepairProgress,
    deleteRepairProgress,
} from '../../../controllers/staff/service/repairProgress.controller.js'
import { protect, serviceStaff } from '../../../middleware/authMiddleware.js'

const router = express.Router()

// Bảo vệ tất cả route bằng serviceStaff
router.use(protect, serviceStaff)

router.route('/')
    .get(getRepairProgresses)      // GET /api/staff/service/repair-progress
    .post(createRepairProgress)    // POST /api/staff/service/repair-progress

router.route('/:id')
    .get(getRepairProgressById)    // GET /api/staff/service/repair-progress/:id
    .put(updateRepairProgress)     // PUT /api/staff/service/repair-progress/:id
    .delete(deleteRepairProgress)  // DELETE /api/staff/service/repair-progress/:id

export default router