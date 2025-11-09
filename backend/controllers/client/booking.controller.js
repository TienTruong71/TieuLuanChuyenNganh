// backend/controllers/client/booking.controller.js
import Booking from '../../models/bookingModel.js'
import ServicePackage from '../../models/servicepackageModel.js'
import asyncHandler from 'express-async-handler'

// @desc    Lấy danh sách booking của khách hàng
// @route   GET /api/client/bookings
// @access  Private/Customer
export const getBookings = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status || '' // Lọc theo status

    const query = {
        user_id: req.user._id, // Chỉ lấy booking của user hiện tại
    }
    if (status) {
        query.status = status
    }

    const total = await Booking.countDocuments(query)
    const bookings = await Booking.find(query)
        .populate('service_id', 'service_name price duration')
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
        .populate('service_id', 'service_name price duration')

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
    const { service_id, booking_date, time_slot } = req.body

    // Validate
    if (!service_id || !booking_date || !time_slot) {
        res.status(400)
        throw new Error('Vui lòng nhập đầy đủ thông tin: dịch vụ, ngày, khung giờ')
    }

    // Kiểm tra service tồn tại
    const service = await ServicePackage.findById(service_id)
    if (!service) {
        res.status(404)
        throw new Error('Dịch vụ không tồn tại')
    }

    // Kiểm tra khung giờ hợp lệ
    const validTimeSlots = ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00']
    if (!validTimeSlots.includes(time_slot)) {
        res.status(400)
        throw new Error('Khung giờ không hợp lệ')
    }

    // Kiểm tra booking trùng
    const existingBooking = await Booking.findOne({
        service_id,
        booking_date: new Date(booking_date),
        time_slot,
    })
    if (existingBooking) {
        res.status(400)
        throw new Error('Khung giờ này đã được đặt')
    }

    const booking = await Booking.create({
        user_id: req.user._id,
        service_id,
        booking_date: new Date(booking_date),
        time_slot,
        status: 'pending',
    })

    res.status(201).json({
        message: 'Tạo booking thành công',
        booking: await Booking.findById(booking._id).populate('service_id', 'service_name price duration'),
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