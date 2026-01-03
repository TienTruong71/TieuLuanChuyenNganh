// backend/routes/staff/sale/appointment.routes.js
import express from 'express'
import {
    getAppointments,
    getAppointmentById,
    updateAppointment,
} from '../../../controllers/staff/sale/appointment.controller.js'
import { protect, saleStaff } from '../../../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, saleStaff)

router.route('/')
    .get(getAppointments)      // GET /api/staff/sale/appointments

router.route('/:id')
    .get(getAppointmentById)   // GET /api/staff/sale/appointments/:id
    .put(updateAppointment)    // PUT /api/staff/sale/appointments/:id

export default router
