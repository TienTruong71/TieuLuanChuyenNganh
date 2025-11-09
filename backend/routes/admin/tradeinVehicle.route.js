// backend/routes/admin/tradeinVehicle.routes.js
import express from 'express'
import {
    getTradeinVehicles,
    getTradeinVehicleById,
    createTradeinVehicle,
    updateTradeinVehicle,
    deleteTradeinVehicle,
} from '../../controllers/admin/tradeinVehicle.controller.js'
import { protect, admin } from '../../middleware/authMiddleware.js'

const router = express.Router()

// Bảo vệ tất cả route bằng admin
router.use(protect, admin)

router.route('/')
    .get(getTradeinVehicles)       // GET /api/admin/tradein-vehicles
    .post(createTradeinVehicle)    // POST /api/admin/tradein-vehicles

router.route('/:id')
    .get(getTradeinVehicleById)    // GET /api/admin/tradein-vehicles/:id
    .put(updateTradeinVehicle)     // PUT /api/admin/tradein-vehicles/:id
    .delete(deleteTradeinVehicle)  // DELETE /api/admin/tradein-vehicles/:id

export default router