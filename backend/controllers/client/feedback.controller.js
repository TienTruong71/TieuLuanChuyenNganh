// backend/controllers/client/feedback.controller.js
import Feedback from '../../models/feedbackModel.js'
import Product from '../../models/productModel.js'
import ServicePackage from '../../models/servicepackageModel.js'
import asyncHandler from 'express-async-handler'

// @desc    Lấy danh sách feedback của khách hàng
// @route   GET /api/client/feedbacks
// @access  Private/Customer
export const getFeedbacks = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const productId = req.query.product_id || ''
    const serviceId = req.query.service_id || ''

    const query = { user_id: req.user._id }
    if (productId) query.product_id = productId
    if (serviceId) query.service_id = serviceId

    const total = await Feedback.countDocuments(query)
    const feedbacks = await Feedback.find(query)
        .populate('product_id', 'product_name')
        .populate('service_id', 'service_name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })

    res.json({
        feedbacks,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    })
})

// @desc    Lấy chi tiết feedback
// @route   GET /api/client/feedbacks/:id
// @access  Private/Customer
export const getFeedbackById = asyncHandler(async (req, res) => {
    const feedback = await Feedback.findById(req.params.id)
        .populate('product_id', 'product_name')
        .populate('service_id', 'service_name')

    if (!feedback) {
        res.status(404)
        throw new Error('Phản hồi không tồn tại')
    }

    if (feedback.user_id.toString() !== req.user._id.toString()) {
        res.status(403)
        throw new Error('Không có quyền xem phản hồi này')
    }

    res.json(feedback)
})

// @desc    Tạo feedback mới
// @route   POST /api/client/feedbacks
// @access  Private/Customer
export const createFeedback = asyncHandler(async (req, res) => {
    const { product_id, service_id, rating, comment } = req.body

    // Validate
    if (!rating || (!product_id && !service_id)) {
        res.status(400)
        throw new Error('Vui lòng cung cấp rating và product_id hoặc service_id')
    }

    if (rating < 1 || rating > 5) {
        res.status(400)
        throw new Error('Rating phải từ 1 đến 5')
    }

    // Kiểm tra product hoặc service tồn tại
    if (product_id) {
        const product = await Product.findById(product_id)
        if (!product) {
            res.status(404)
            throw new Error('Sản phẩm không tồn tại')
        }
    } else if (service_id) {
        const service = await ServicePackage.findById(service_id)
        if (!service) {
            res.status(404)
            throw new Error('Dịch vụ không tồn tại')
        }
    }

    // Kiểm tra xem đã feedback chưa
    const existingFeedback = await Feedback.findOne({
        user_id: req.user._id,
        $or: [{ product_id }, { service_id }],
    })
    if (existingFeedback) {
        res.status(400)
        throw new Error('Bạn đã gửi phản hồi cho sản phẩm/dịch vụ này')
    }

    const feedback = await Feedback.create({
        user_id: req.user._id,
        product_id: product_id || null,
        service_id: service_id || null,
        rating,
        comment: comment || '',
    })

    res.status(201).json({
        message: 'Gửi phản hồi thành công',
        feedback: await Feedback.findById(feedback._id)
            .populate('product_id', 'product_name')
            .populate('service_id', 'service_name'),
    })
})

// @desc    Cập nhật feedback
// @route   PUT /api/client/feedbacks/:id
// @access  Private/Customer
export const updateFeedback = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body

    const feedback = await Feedback.findById(req.params.id)
    if (!feedback) {
        res.status(404)
        throw new Error('Phản hồi không tồn tại')
    }

    if (feedback.user_id.toString() !== req.user._id.toString()) {
        res.status(403)
        throw new Error('Không có quyền chỉnh sửa phản hồi này')
    }

    if (rating && (rating < 1 || rating > 5)) {
        res.status(400)
        throw new Error('Rating phải từ 1 đến 5')
    }

    feedback.rating = rating || feedback.rating
    feedback.comment = comment !== undefined ? comment : feedback.comment

    const updated = await feedback.save()

    res.json({
        message: 'Cập nhật phản hồi thành công',
        feedback: await Feedback.findById(updated._id)
            .populate('product_id', 'product_name')
            .populate('service_id', 'service_name'),
    })
})

// @desc    Xóa feedback
// @route   DELETE /api/client/feedbacks/:id
// @access  Private/Customer
export const deleteFeedback = asyncHandler(async (req, res) => {
    const feedback = await Feedback.findById(req.params.id)
    if (!feedback) {
        res.status(404)
        throw new Error('Phản hồi không tồn tại')
    }

    if (feedback.user_id.toString() !== req.user._id.toString()) {
        res.status(403)
        throw new Error('Không có quyền xóa phản hồi này')
    }

    await feedback.deleteOne()
    res.json({ message: 'Xóa phản hồi thành công' })
})