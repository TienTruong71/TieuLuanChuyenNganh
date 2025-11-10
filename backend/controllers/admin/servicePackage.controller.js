// backend/controllers/admin/servicePackage.controller.js
import ServicePackage from '../../models/servicepackageModel.js'
import asyncHandler from 'express-async-handler'

// @desc    Lấy danh sách gói dịch vụ
// @route   GET /api/admin/service-packages
// @access  Private/Admin
export const getServicePackages = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ''

    const query = {
        $or: [
            { service_name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ],
    }

    const total = await ServicePackage.countDocuments(query)
    const servicePackages = await ServicePackage.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })

    res.json({
        servicePackages: servicePackages.map(sp => ({
            ...sp.toObject(),
            price: parseFloat(sp.price),
        })),
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    })
})

// @desc    Lấy chi tiết gói dịch vụ
// @route   GET /api/admin/service-packages/:id
// @access  Private/Admin
export const getServicePackageById = asyncHandler(async (req, res) => {
    const servicePackage = await ServicePackage.findById(req.params.id)
    if (!servicePackage) {
        res.status(404)
        throw new Error('Gói dịch vụ không tồn tại')
    }

    res.json({
        ...servicePackage.toObject(),
        price: parseFloat(servicePackage.price),
    })
})

// @desc    Tạo gói dịch vụ mới
// @route   POST /api/admin/service-packages
// @access  Private/Admin
export const createServicePackage = asyncHandler(async (req, res) => {
    const { service_name, description, price, duration } = req.body

    // Validate
    if (!service_name || !price || !duration) {
        res.status(400)
        throw new Error('Vui lòng nhập đầy đủ thông tin: tên, giá, thời gian')
    }

    const exists = await ServicePackage.findOne({ service_name })
    if (exists) {
        res.status(400)
        throw new Error('Tên gói dịch vụ đã tồn tại')
    }

    const servicePackage = await ServicePackage.create({
        service_name,
        description: description || '',
        price: parseFloat(price),
        duration,
    })

    res.status(201).json({
        message: 'Tạo gói dịch vụ thành công',
        servicePackage: {
            ...servicePackage.toObject(),
            price: parseFloat(servicePackage.price),
        },
    })
})

// @desc    Cập nhật gói dịch vụ
// @route   PUT /api/admin/service-packages/:id
// @access  Private/Admin
export const updateServicePackage = asyncHandler(async (req, res) => {
    const { service_name, description, price, duration } = req.body

    const servicePackage = await ServicePackage.findById(req.params.id)
    if (!servicePackage) {
        res.status(404)
        throw new Error('Gói dịch vụ không tồn tại')
    }

    // Kiểm tra tên trùng (nếu đổi tên)
    if (service_name && service_name !== servicePackage.service_name) {
        const exists = await ServicePackage.findOne({ service_name })
        if (exists) {
            res.status(400)
            throw new Error('Tên gói dịch vụ đã tồn tại')
        }
    }

    servicePackage.service_name = service_name || servicePackage.service_name
    servicePackage.description = description !== undefined ? description : servicePackage.description
    servicePackage.price = price ? parseFloat(price) : servicePackage.price
    servicePackage.duration = duration || servicePackage.duration

    const updated = await servicePackage.save()

    res.json({
        message: 'Cập nhật gói dịch vụ thành công',
        servicePackage: {
            ...updated.toObject(),
            price: parseFloat(updated.price),
        },
    })
})

// @desc    Xóa gói dịch vụ
// @route   DELETE /api/admin/service-packages/:id
// @access  Private/Admin
export const deleteServicePackage = asyncHandler(async (req, res) => {
    const servicePackage = await ServicePackage.findById(req.params.id)
    if (!servicePackage) {
        res.status(404)
        throw new Error('Gói dịch vụ không tồn tại')
    }

    await servicePackage.deleteOne()
    res.json({ message: 'Xóa gói dịch vụ thành công' })
})