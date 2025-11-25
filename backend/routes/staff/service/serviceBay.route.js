// backend/routes/staff/service/serviceBay.routes.js
import express from 'express'
import {
    getServiceBays,
    getServiceBayById,
    createServiceBay,
    updateServiceBay,
    deleteServiceBay,
} from '../../../controllers/staff/service/serviceBay.controller.js'
import { protect, serviceStaff } from '../../../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, serviceStaff)

router.route('/')
    .get(getServiceBays)      // GET /api/staff/service/service-bays
    .post(createServiceBay)   // POST /api/staff/service/service-bays

router.route('/:id')
    .get(getServiceBayById)   // GET /api/staff/service/service-bays/:id
    .put(updateServiceBay)    // PUT /api/staff/service/service-bays/:id
    .delete(deleteServiceBay) // DELETE /api/staff/service/service-bays/:id

export default router