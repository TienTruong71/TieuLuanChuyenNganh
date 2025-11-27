// backend/routes/staff/service/appointment.routes.js
import express from 'express'
import {
    getAppointments,
    getAppointmentById,
    updateAppointment,
} from '../../../controllers/staff/service/appointment.controller.js'
import { protect, serviceStaff } from '../../../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, serviceStaff)

router.route('/')
    .get(getAppointments)      // GET /api/staff/service/appointments

router.route('/:id')
    .get(getAppointmentById)   // GET /api/staff/service/appointments/:id
    .put(updateAppointment)    // PUT /api/staff/service/appointments/:id

export default router