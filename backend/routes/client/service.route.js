// backend/routes/client/service.route.js
import express from 'express'
import ServicePackage from '../../models/servicepackageModel.js'
import asyncHandler from 'express-async-handler'

const router = express.Router()

// @desc    Lấy danh sách services
// @route   GET /api/client/services
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
    const services = await ServicePackage.find({})
    res.json(services)
}))

// @desc    Lấy chi tiết service
// @route   GET /api/client/services/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
    const service = await ServicePackage.findById(req.params.id)
    
    if (!service) {
        res.status(404)
        throw new Error('Không tìm thấy dịch vụ')
    }
    
    res.json(service)
}))

export default router