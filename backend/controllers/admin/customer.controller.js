// backend/controllers/admin/customer.controller.js
import User from '../../models/userModel.js'
import asyncHandler from 'express-async-handler'

// @desc    Lấy danh sách khách hàng (chỉ role "customer")
// @route   GET /api/admin/customers
// @access  Private/Admin
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

// @desc    Lấy chi tiết khách hàng
// @route   GET /api/admin/customers/:id
// @access  Private/Admin
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

    res.json(customer)
})

// @desc    Cập nhật khách hàng
// @route   PUT /api/admin/customers/:id
// @access  Private/Admin
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

    // Cập nhật
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

// @desc    Xóa (hoặc vô hiệu hóa) khách hàng
// @route   DELETE /api/admin/customers/:id
// @access  Private/Admin
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

    // Thay vì xóa thật → đổi status
    customer.status = 'suspended'
    await customer.save()

    res.json({ message: 'Đã vô hiệu hóa khách hàng' })
})

// Helper: Lấy danh sách role_id của "customer"
const getCustomerRoleIds = async () => {
    const Role = (await import('../../models/roleModel.js')).default
    const customerRoles = await Role.find({ role_name: { $in: ['customer', 'Customer'] } })
    return customerRoles.map(r => r._id.toString())
}