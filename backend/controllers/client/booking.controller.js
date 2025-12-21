// backend/controllers/client/booking.controller.js
import Booking from '../../models/bookingModel.js'
import ServicePackage from '../../models/servicepackageModel.js'
import Product from '../../models/productModel.js'
import asyncHandler from 'express-async-handler'

// @desc    Lấy danh sách booking của khách hàng
// @route   GET /api/client/bookings
// @access  Private/Customer
export const getBookings = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status || ''

    const query = {
        user_id: req.user._id,
    }
    if (status) {
        query.status = status
    }

    const total = await Booking.countDocuments(query)
    const bookings = await Booking.find(query)
        .populate('service_id', 'service_name price duration description') // ✅ THÊM description
        .populate('product_id', 'product_name price type description')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ booking_date: -1 })

    res.json({
        bookings,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    })
})

// @desc    Lấy chi tiết booking
// @route   GET /api/client/bookings/:id
// @access  Private/Customer
export const getBookingById = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate('service_id', 'service_name price duration description') // ✅ THÊM description
        .populate('product_id', 'product_name price type description')

    if (!booking) {
        res.status(404)
        throw new Error('Booking không tồn tại')
    }

    // Kiểm tra quyền sở hữu
    if (booking.user_id.toString() !== req.user._id.toString()) {
        res.status(403)
        throw new Error('Không có quyền truy cập booking này')
    }

    res.json(booking)
})

// @desc    Tạo booking mới
// @route   POST /api/client/bookings
// @access  Private/Customer
export const createBooking = asyncHandler(async (req, res) => {
    const { service_id, product_id, booking_date, time_slot, booking_type } = req.body

    // Validate
    if (!booking_date || !time_slot) {
        res.status(400)
        throw new Error('Vui lòng nhập đầy đủ ngày và khung giờ')
    }

    if (!booking_type || !['service', 'vehicle'].includes(booking_type)) {
        res.status(400)
        throw new Error('Loại booking không hợp lệ')
    }

    let itemToBook = null

    if (booking_type === 'service') {
        if (!service_id) {
            res.status(400)
            throw new Error('Vui lòng chọn dịch vụ')
        }

        itemToBook = await ServicePackage.findById(service_id)
        if (!itemToBook) {
            res.status(404)
            throw new Error('Dịch vụ không tồn tại')
        }
    }

    if (booking_type === 'vehicle') {
        if (!product_id) {
            res.status(400)
            throw new Error('Vui lòng chọn xe')
        }

        itemToBook = await Product.findById(product_id)
        if (!itemToBook) {
            res.status(404)
            throw new Error('Xe không tồn tại')
        }

        if (itemToBook.type !== 'vehicle') {
            res.status(400)
            throw new Error('Sản phẩm này không phải xe ô tô')
        }
    }

    // Kiểm tra khung giờ hợp lệ
    const validTimeSlots = ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00']
    if (!validTimeSlots.includes(time_slot)) {
        res.status(400)
        throw new Error('Khung giờ không hợp lệ')
    }

    // Kiểm tra booking trùng
    const existingBookingQuery = {
        booking_date: new Date(booking_date),
        time_slot,
    }

    if (booking_type === 'service') {
        existingBookingQuery.service_id = service_id
    } else {
        existingBookingQuery.product_id = product_id
    }

    const existingBooking = await Booking.findOne(existingBookingQuery)
    if (existingBooking) {
        res.status(400)
        throw new Error('Khung giờ này đã được đặt')
    }

    // Tạo booking
    const booking = await Booking.create({
        user_id: req.user._id,
        service_id: booking_type === 'service' ? service_id : undefined,
        product_id: booking_type === 'vehicle' ? product_id : undefined,
        booking_type,
        booking_date: new Date(booking_date),
        time_slot,
        status: 'pending',
    })

    // ✅ Populate lại với description đầy đủ
    const populatedBooking = await Booking.findById(booking._id)
        .populate('service_id', 'service_name price duration description') // ✅ THÊM description
        .populate('product_id', 'product_name price type description')

    res.status(201).json({
        message: 'Tạo booking thành công',
        booking: populatedBooking,
    })
})

// @desc    Hủy booking
// @route   DELETE /api/client/bookings/:id
// @access  Private/Customer
export const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
        res.status(404)
        throw new Error('Booking không tồn tại')
    }

    // Kiểm tra quyền sở hữu
    if (booking.user_id.toString() !== req.user._id.toString()) {
        res.status(403)
        throw new Error('Không có quyền hủy booking này')
    }

    // Chỉ cho phép hủy nếu trạng thái là pending
    if (booking.status !== 'pending') {
        res.status(400)
        throw new Error('Chỉ có thể hủy booking đang chờ')
    }

    booking.status = 'cancelled'
    await booking.save()

    res.json({ message: 'Hủy booking thành công' })
})