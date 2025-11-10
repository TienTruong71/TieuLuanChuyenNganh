import express from 'express'
import {
    getBookings,
    getBookingById,
    createBooking,
    cancelBooking,
} from '../../controllers/client/booking.controller.js'
import { protect, customer } from '../../middleware/authMiddleware.js'

const router = express.Router()

// Bảo vệ tất cả route bằng customer
router.use(protect, customer)

router.route('/')
    .get(getBookings)      // GET /api/client/bookings
    .post(createBooking)   // POST /api/client/bookings

router.route('/:id')
    .get(getBookingById)   // GET /api/client/bookings/:id
    .delete(cancelBooking) // DELETE /api/client/bookings/:id

export default router