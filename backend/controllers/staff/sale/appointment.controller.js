// backend/controllers/staff/sale/appointment.controller.js
import Booking from '../../../models/bookingModel.js'
import User from '../../../models/userModel.js'
import Notification from '../../../models/notificationModel.js'
import asyncHandler from 'express-async-handler'

// @desc    Lấy danh sách lịch lái thử (cho Sale Staff)
// @route   GET /api/staff/sale/appointments
// @access  Private/Sale Staff
export const getAppointments = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status || ''
    const search = req.query.search || ''

    // Initialize query object: vehicle bookings only
    const query = { booking_type: 'vehicle' }
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
        .populate('product_id', 'name price image') // Populate product details (adjust fields as needed)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ booking_date: 1 })

    // Inject Price logic if needed (similar to service)
    const appointments = appointmentsData.map(app => {
        const appObj = app.toObject();
        // If there's specific logic for car price, add it here.
        // For now, vehicle bookings might doesn't usually carry a price for the booking itself (free test drive).
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

// @desc    Lấy chi tiết lịch lái thử
// @route   GET /api/staff/sale/appointments/:id
// @access  Private/Sale Staff
export const getAppointmentById = asyncHandler(async (req, res) => {
    const appointment = await Booking.findById(req.params.id)
        .populate('user_id', 'full_name email phone')
        .populate('product_id', 'name price image')

    if (!appointment || appointment.booking_type !== 'vehicle') {
        res.status(404)
        throw new Error('Lịch lái thử không tồn tại hoặc không hợp lệ')
    }

    res.json(appointment)
})

// @desc    Cập nhật trạng thái lịch lái thử
// @route   PUT /api/staff/sale/appointments/:id
// @access  Private/Sale Staff
export const updateAppointment = asyncHandler(async (req, res) => {
    const { status, note } = req.body

    const appointment = await Booking.findById(req.params.id)
    if (!appointment || appointment.booking_type !== 'vehicle') {
        res.status(404)
        throw new Error('Lịch lái thử không tồn tại hoặc không hợp lệ')
    }

    if (!['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        res.status(400)
        throw new Error('Trạng thái không hợp lệ')
    }

    appointment.status = status
    // Save note if provided
    if (note) {
        appointment.note = note
    }

    const updated = await appointment.save()

    // Create Notification if Cancelled
    if (status === 'cancelled') {
        console.log('--- CANCELLED STATUS DETECTED ---');
        console.log('Appt ID:', appointment._id);
        console.log('User ID:', appointment.user_id);

        const message = `Lịch lái thử xe của bạn vào ngày ${new Date(appointment.booking_date).toLocaleDateString("vi-VN")} đã bị hủy.${note ? ` Lý do: ${note}` : ''}`;

        console.log('Notification Message:', message);

        try {
            await Notification.create({
                user_id: appointment.user_id,
                message: message,
                is_read: false,
            })
            console.log('Notification created successfully');
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    }
    // Create Notification if Confirmed (Optional but good UX)
    else if (status === 'confirmed') {
        console.log('--- CONFIRMED STATUS DETECTED ---');
        const message = `Lịch lái thử xe của bạn vào ngày ${new Date(appointment.booking_date).toLocaleDateString("vi-VN")} đã được xác nhận. Vui lòng đến đúng giờ.`;
        await Notification.create({
            user_id: appointment.user_id,
            message: message,
            is_read: false,
        })
    }

    // Notify "completed" or other statuses if needed

    res.json({
        message: 'Cập nhật lịch lái thử thành công',
        appointment: await Booking.findById(updated._id)
            .populate('user_id', 'full_name email phone')
            .populate('product_id', 'name price image'),
    })
})
