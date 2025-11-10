// backend/routes/admin/servicePackage.routes.js
import express from 'express'
import {
    getServicePackages,
    getServicePackageById,
    createServicePackage,
    updateServicePackage,
    deleteServicePackage,
} from '../../controllers/admin/servicePackage.controller.js'
import { protect, admin } from '../../middleware/authMiddleware.js'

const router = express.Router()

// Bảo vệ tất cả route bằng admin
router.use(protect, admin)

router.route('/')
    .get(getServicePackages)       // GET /api/admin/service-packages
    .post(createServicePackage)    // POST /api/admin/service-packages

router.route('/:id')
    .get(getServicePackageById)    // GET /api/admin/service-packages/:id
    .put(updateServicePackage)     // PUT /api/admin/service-packages/:id
    .delete(deleteServicePackage)  // DELETE /api/admin/service-packages/:id

export default router