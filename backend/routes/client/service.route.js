// backend/routes/client/service.route.js
import express from 'express'
import ServicePackage from '../../models/servicepackageModel.js'
import asyncHandler from 'express-async-handler'

const router = express.Router()

// @desc    Lấy danh sách services
// @route   GET /api/client/services
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
    const page = parseInt(req.query.current || req.query.page) || 1;
    const limit = parseInt(req.query.pageSize || req.query.limit) || 12;
    const search = req.query.search || '';
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = (req.query.sortOrder === 'ascend' || req.query.sortOrder === 'asc') ? 1 : -1;

    let filter = {};
    if (search) {
        filter.$or = [
            { service_name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const sortObj = {};
    sortObj[sortField] = sortOrder;

    const total = await ServicePackage.countDocuments(filter);
    const services = await ServicePackage.find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit);

    res.json({
        services: services.map(sp => ({
            ...sp.toObject(),
            price: parseFloat(sp.price),
        })),
        pagination: {
            current: page,
            pageSize: limit,
            total
        }
    });
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