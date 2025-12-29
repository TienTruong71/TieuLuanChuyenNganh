// backend/controllers/staff/service/appointment.controller.js
import Booking from '../../../models/bookingModel.js'
import ServicePackage from '../../../models/servicepackageModel.js'
import User from '../../../models/userModel.js'
import asyncHandler from 'express-async-handler'

// @desc    Lấy danh sách lịch hẹn (cho Service Staff)
// @route   GET /api/staff/service/appointments
// @access  Private/Service Staff
export const getAppointments = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status || ''
    const search = req.query.search || ''

    // Initialize query object FIRST
    const query = {}
    if (status) query.status = status

    const startDate = req.query.startDate ? new Date(req.query.startDate) : null
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null

    const dateStr = req.query.date; // YYYY-MM-DD
    if (dateStr) {
        const start = new Date(dateStr);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateStr);
        end.setHours(23, 59, 59, 999);
        query.booking_date = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
        query.booking_date = { $gte: startDate, $lte: endDate }
    }

    if (search) {
        const users = await User.find({
            $or: [
                { full_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ],
        }).select('_id')
        query.user_id = { $in: users.map(u => u._id) }
    }

    const total = await Booking.countDocuments(query)
    const appointmentsData = await Booking.find(query)
        .populate('user_id', 'full_name email phone')
        .populate('service_id', 'service_name price duration')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ booking_date: 1 })

    // Inject Snapshot Price
    const appointments = appointmentsData.map(app => {
        const appObj = app.toObject();
        if (appObj.price !== undefined && appObj.price !== null) {
            if (appObj.service_id) appObj.service_id.price = appObj.price;
        }
        return appObj;
    });

    res.json({
        appointments,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    })
})

// @desc    Lấy chi tiết lịch hẹn
// @route   GET /api/staff/service/appointments/:id
// @access  Private/Service Staff
export const getAppointmentById = asyncHandler(async (req, res) => {
    const appointment = await Booking.findById(req.params.id)
        .populate('user_id', 'full_name email phone')
        .populate('service_id', 'service_name price duration')

    if (!appointment) {
        res.status(404)
        throw new Error('Lịch hẹn không tồn tại')
    }

    res.json(appointment)
})

// @desc    Cập nhật trạng thái lịch hẹn (xác nhận, hủy, hoàn thành)
// @route   PUT /api/staff/service/appointments/:id
// @access  Private/Service Staff
export const updateAppointment = asyncHandler(async (req, res) => {
    const { status } = req.body

    const appointment = await Booking.findById(req.params.id)
    if (!appointment) {
        res.status(404)
        throw new Error('Lịch hẹn không tồn tại')
    }

    if (!['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        res.status(400)
        throw new Error('Trạng thái không hợp lệ')
    }

    appointment.status = status
    const updated = await appointment.save()

    res.json({
        message: 'Cập nhật lịch hẹn thành công',
        appointment: await Booking.findById(updated._id)
            .populate('user_id', 'full_name email phone')
            .populate('service_id', 'service_name price duration'),
    })
})