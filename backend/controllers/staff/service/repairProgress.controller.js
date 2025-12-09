// backend/controllers/staff/service/repairProgress.controller.js
import RepairProgress from '../../../models/repairProgressModel.js'
import Booking from '../../../models/bookingModel.js'
import User from '../../../models/userModel.js'
import ServicePackage from '../../../models/servicepackageModel.js'
import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import ServiceBay from '../../../models/serviceBayModel.js'
// @desc    Lấy danh sách tiến độ sửa chữa (cho Service Staff)
// @route   GET /api/staff/service/repair-progress
// @access  Private/Service Staff
export const getRepairProgresses = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status || ''
    const search = req.query.search || ''

    const query = {}
    if (status) query.status = status
    if (search) {
        const bookings = await Booking.find({
            $or: [
                { user_id: { $in: await User.find({ full_name: { $regex: search, $options: 'i' } }).select('_id') } },
                { service_id: { $in: await ServicePackage.find({ service_name: { $regex: search, $options: 'i' } }).select('_id') } },
            ],
            status: { $ne: 'cancelled' },
        }).select('_id')
        query.booking_id = { $in: bookings.map(b => b._id) }
    } else {
        const bookings = await Booking.find({ status: { $ne: 'cancelled' } }).select('_id')
        query.booking_id = { $in: bookings.map(b => b._id) }
    }

    const total = await RepairProgress.countDocuments(query)
    const progresses = await RepairProgress.find(query)
        .populate({
            path: 'booking_id',
            populate: [
                { path: 'user_id', select: 'full_name email phone' },
                { path: 'service_id', select: 'service_name price duration' },
            ],
        })
        .populate({
            path: 'staff_id',
            select: 'full_name',
            match: { _id: { $exists: true } },
        })

    // Log chi tiết để debug
    progresses.forEach(p => {
        const rawProgress = p.toObject();
        if (!p.staff_id) {
            console.error(
                `Populate lỗi: staff_id không tìm thấy cho repairProgress ${p._id}. ` +
                `Kiểm tra users collection với _id: ${rawProgress.staff_id}. ` +
                `Raw staff_id in DB: ${mongoose.Types.ObjectId.isValid(rawProgress.staff_id) ? rawProgress.staff_id : 'Invalid or Undefined'}`
            );
        }
        if (!p.booking_id) {
            console.error(`Populate lỗi: booking_id không tìm thấy cho repairProgress ${p._id}. Kiểm tra bookings collection.`);
        } else if (!p.booking_id.service_id) {
            console.error(`Populate lỗi: service_id không tìm thấy cho booking ${p.booking_id._id}. Kiểm tra servicepackages collection.`);
        }
    });

    res.json({
        repairProgresses: progresses,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    })
})

// @desc    Lấy chi tiết tiến độ sửa chữa
// @route   GET /api/staff/service/repair-progress/:id
// @access  Private/Service Staff
export const getRepairProgressById = asyncHandler(async (req, res) => {
    const progress = await RepairProgress.findById(req.params.id)
        .populate({
            path: 'booking_id',
            populate: [
                { path: 'user_id', select: 'full_name email phone' },
                { path: 'service_id', select: 'service_name price duration' },
            ],
        })
        .populate('staff_id', 'full_name')

    if (!progress) {
        res.status(404)
        throw new Error('Tiến độ sửa chữa không tồn tại')
    }

    res.json(progress)
})

// @desc    Tạo tiến độ sửa chữa mới
// @route   POST /api/staff/service/repair-progress
// @access  Private/Service Staff
export const createRepairProgress = asyncHandler(async (req, res) => {
    const { booking_id, status, notes, estimated_completion } = req.body

    // Validate
    if (!booking_id || !status) {
        res.status(400)
        throw new Error('Vui lòng cung cấp booking_id và trạng thái')
    }

    // Kiểm tra booking tồn tại
    const booking = await Booking.findById(booking_id)
    if (!booking) {
        res.status(404)
        throw new Error('Lịch hẹn không tồn tại')
    }

    // Kiểm tra trạng thái hợp lệ
    if (!['in_progress', 'waiting_parts', 'testing', 'completed'].includes(status)) {
        res.status(400)
        throw new Error('Trạng thái không hợp lệ')
    }

    const progress = await RepairProgress.create({
        booking_id,
        staff_id: req.user._id,
        status,
        notes: notes || '',
        estimated_completion: estimated_completion ? new Date(estimated_completion) : null,
    })

    res.status(201).json({
        message: 'Tạo tiến độ sửa chữa thành công',
        repairProgress: await RepairProgress.findById(progress._id)
            .populate({
                path: 'booking_id',
                populate: [
                    { path: 'user_id', select: 'full_name email phone' },
                    { path: 'service_id', select: 'service_name price duration' },
                ],
            })
            .populate('staff_id', 'full_name'),
    })
})

// @desc    Cập nhật tiến độ sửa chữa
// @route   PUT /api/staff/service/repair-progress/:id
// @access  Private/Service Staff
export const updateRepairProgress = asyncHandler(async (req, res) => {
    const { status, notes, estimated_completion, free_bay } = req.body

    const progress = await RepairProgress.findById(req.params.id)
    if (!progress) {
        res.status(404)
        throw new Error('Tiến độ sửa chữa không tồn tại')
    }

    if (progress.staff_id.toString() !== req.user._id.toString()) {
        res.status(403)
        throw new Error('Không có quyền cập nhật tiến độ này')
    }

    if (status && !['in_progress', 'waiting_parts', 'testing', 'completed'].includes(status)) {
        res.status(400)
        throw new Error('Trạng thái không hợp lệ')
    }

    progress.status = status || progress.status
    progress.notes = notes !== undefined ? notes : progress.notes
    progress.estimated_completion = estimated_completion ? new Date(estimated_completion) : progress.estimated_completion

    if (status === 'completed') {
        await Booking.findByIdAndUpdate(progress.booking_id, { status: 'completed' });

        if (free_bay === true) {
            const bay = await ServiceBay.findOne({ current_booking: progress.booking_id });

            if (bay) {
                bay.status = 'available';
                bay.current_booking = null;
                await bay.save();
            }
        }
    }

    const updated = await progress.save()

    res.json({
        message: 'Cập nhật tiến độ sửa chữa thành công',
        repairProgress: await RepairProgress.findById(updated._id)
            .populate({
                path: 'booking_id',
                populate: [
                    { path: 'user_id', select: 'full_name email phone' },
                    { path: 'service_id', select: 'service_name price duration' },
                ],
            })
            .populate('staff_id', 'full_name'),
    })
})

// @desc    Xóa tiến độ sửa chữa
// @route   DELETE /api/staff/service/repair-progress/:id
// @access  Private/Service Staff
export const deleteRepairProgress = asyncHandler(async (req, res) => {
    const progress = await RepairProgress.findById(req.params.id)
    if (!progress) {
        res.status(404)
        throw new Error('Tiến độ sửa chữa không tồn tại')
    }

    if (progress.staff_id.toString() !== req.user._id.toString()) {
        res.status(403)
        throw new Error('Không có quyền xóa tiến độ này')
    }

    await progress.deleteOne()

    res.json({ message: 'Xóa tiến độ sửa chữa thành công' })
})