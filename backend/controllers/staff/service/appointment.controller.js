import Booking from '../../../models/bookingModel.js'
import ServicePackage from '../../../models/servicepackageModel.js'
import User from '../../../models/userModel.js'
import Notification from '../../../models/notificationModel.js'
import asyncHandler from 'express-async-handler'


export const getAppointments = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status || ''
    const search = req.query.search || ''

    // Initialize query object FIRST
    const query = { booking_type: 'service' }
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

    if (!appointment || appointment.booking_type !== 'service') {
        res.status(404)
        throw new Error('Lịch hẹn không tồn tại hoặc không phải lịch dịch vụ')
    }

    res.json(appointment)
})

// @desc    Cập nhật trạng thái lịch hẹn (xác nhận, hủy, hoàn thành)
// @route   PUT /api/staff/service/appointments/:id
// @access  Private/Service Staff
export const updateAppointment = asyncHandler(async (req, res) => {
    const { status } = req.body

    const appointment = await Booking.findById(req.params.id)
    if (!appointment || appointment.booking_type !== 'service') {
        res.status(404)
        throw new Error('Lịch hẹn không tồn tại hoặc không phải lịch dịch vụ')
    }

    if (!['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        res.status(400)
        throw new Error('Trạng thái không hợp lệ')
    }

    appointment.status = status
    if (req.body.note) {
        appointment.note = req.body.note
    }

    const updated = await appointment.save()

    if (status === 'cancelled') {
        const message = `Lịch hẹn dịch vụ ngày ${new Date(appointment.booking_date).toLocaleDateString("vi-VN")} đã bị hủy.${req.body.note ? ` Lý do: ${req.body.note}` : ''}`;

        await Notification.create({
            user_id: appointment.user_id,
            message: message,
            is_read: false,
        })
    }
    else if (status === 'confirmed') {
        const message = `Lịch hẹn dịch vụ ngày ${new Date(appointment.booking_date).toLocaleDateString("vi-VN")} đã được tiếp nhận. Xin vui lòng đến đúng giờ.`;
        await Notification.create({
            user_id: appointment.user_id,
            message: message,
            is_read: false,
        })
    }

    res.json({
        message: 'Cập nhật lịch hẹn thành công',
        appointment: await Booking.findById(updated._id)
            .populate('user_id', 'full_name email phone')
            .populate('service_id', 'service_name price duration'),
    })
})