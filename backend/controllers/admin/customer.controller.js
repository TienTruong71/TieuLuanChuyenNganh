// backend/controllers/admin/customer.controller.js
import User from '../../models/userModel.js'
import Order from '../../models/orderModel.js'
import OrderItem from '../../models/orderItemModel.js'
import Booking from '../../models/bookingModel.js'
import asyncHandler from 'express-async-handler'


export const getCustomers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ''

    const query = {
        role_id: { $in: await getCustomerRoleIds() }, // Lọc theo role "customer"
        $or: [
            { full_name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
        ],
    }

    const total = await User.countDocuments(query)
    const customers = await User.find(query)
        .select('-password')
        .populate('role_id', 'role_name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })

    res.json({
        customers,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    })
})


export const getCustomerById = asyncHandler(async (req, res) => {
    const customer = await User.findById(req.params.id)
        .select('-password')
        .populate('role_id', 'role_name')

    if (!customer) {
        res.status(404)
        throw new Error('Khách hàng không tồn tại')
    }

    const customerRoleIds = await getCustomerRoleIds()
    if (!customerRoleIds.includes(customer.role_id._id.toString())) {
        res.status(400)
        throw new Error('Người dùng này không phải là khách hàng')
    }

    // thêm thông tin thống kê nhanh để UI admin có thể hiển thị
    const orderCount = await Order.countDocuments({ user_id: customer._id })
    const bookingCount = await Booking.countDocuments({ user_id: customer._id })

    res.json({
        ...customer.toObject(),
        orderCount,
        bookingCount,
    })
})


export const updateCustomer = asyncHandler(async (req, res) => {
    const { full_name, email, phone, address, status } = req.body

    const customer = await User.findById(req.params.id)
    if (!customer) {
        res.status(404)
        throw new Error('Khách hàng không tồn tại')
    }

    const customerRoleIds = await getCustomerRoleIds()
    if (!customerRoleIds.includes(customer.role_id.toString())) {
        res.status(400)
        throw new Error('Không thể cập nhật: không phải khách hàng')
    }

    customer.full_name = full_name || customer.full_name
    customer.email = email || customer.email
    customer.phone = phone || customer.phone
    customer.address = address || customer.address
    customer.status = status || customer.status

    const updated = await customer.save()
    res.json({
        message: 'Cập nhật khách hàng thành công',
        customer: {
            _id: updated._id,
            username: updated.username,
            full_name: updated.full_name,
            email: updated.email,
            phone: updated.phone,
            address: updated.address,
            status: updated.status,
        },
    })
})


export const deleteCustomer = asyncHandler(async (req, res) => {
    const customer = await User.findById(req.params.id)
    if (!customer) {
        res.status(404)
        throw new Error('Khách hàng không tồn tại')
    }

    const customerRoleIds = await getCustomerRoleIds()
    if (!customerRoleIds.includes(customer.role_id.toString())) {
        res.status(400)
        throw new Error('Không thể xóa: không phải khách hàng')
    }

    const activeOrder = await Order.findOne({
        user_id: customer._id,
        status: { $in: ['pending', 'processing', 'shipped'] }
    })
    if (activeOrder) {
        res.status(400)
        throw new Error('Không thể khóa: Khách hàng đang có đơn hàng chưa hoàn thành')
    }

    const activeBooking = await Booking.findOne({
        user_id: customer._id,
        status: { $in: ['pending', 'confirmed', 'in_progress'] }
    })
    if (activeBooking) {
        res.status(400)
        throw new Error('Không thể khóa: Khách hàng đang có lịch hẹn/dịch vụ chưa hoàn thành')
    }

    customer.status = 'suspended'
    await customer.save()

    res.json({ message: 'Đã vô hiệu hóa khách hàng' })
})


const assertIsCustomer = async (id) => {
    const customer = await User.findById(id)
    if (!customer) {
        const err = new Error('Khách hàng không tồn tại')
        err.statusCode = 404
        throw err
    }
    const customerRoleIds = await getCustomerRoleIds()
    if (!customerRoleIds.includes(customer.role_id.toString())) {
        const err = new Error('Người dùng này không phải là khách hàng')
        err.statusCode = 400
        throw err
    }
    return customer
}

export const getOrdersByCustomer = asyncHandler(async (req, res) => {
    const customerId = req.params.id
    await assertIsCustomer(customerId)

    const orders = await Order.find({ user_id: customerId })
        .sort({ createdAt: -1 })
        .lean()

    if (!orders.length) {
        return res.status(404).json({ message: 'Không có lịch sử đơn hàng' })
    }

    for (let order of orders) {
        const items = await OrderItem.find({ order_id: order._id })
            .populate({
                path: 'product_id',
                select: 'product_name price images category_id',
                populate: { path: 'category_id', select: 'category_name' }
            })
        order.items = items
    }

    res.json({ orders })
})


export const getBookingsByCustomer = asyncHandler(async (req, res) => {
    const customerId = req.params.id
    await assertIsCustomer(customerId)

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status || ''

    const query = { user_id: customerId }
    if (status) query.status = status

    const total = await Booking.countDocuments(query)
    const bookings = await Booking.find(query)
        .populate('service_id', 'service_name price duration description')
        .populate('product_id', 'product_name price type description')
        .sort({ booking_date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)

    const books = bookings.map(b => {
        const bookingObj = b.toObject()
        const snapshotPrice = bookingObj.price
        if (snapshotPrice !== undefined && snapshotPrice !== null) {
            if (bookingObj.service_id) bookingObj.service_id.price = snapshotPrice
            if (bookingObj.product_id) bookingObj.product_id.price = snapshotPrice
        }
        return bookingObj
    })

    res.json({
        bookings: books,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    })
})

const getCustomerRoleIds = async () => {
    const Role = (await import('../../models/roleModel.js')).default
    const customerRoles = await Role.find({ role_name: { $in: ['customer', 'Customer'] } })
    return customerRoles.map(r => r._id.toString())
}