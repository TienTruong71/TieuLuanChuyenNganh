// backend/controllers/admin/staff.controller.js
import User from '../../models/userModel.js'
import Employee from '../../models/employeeModel.js'
import asyncHandler from 'express-async-handler'
import Role from '../../models/roleModel.js'

// @desc    Lấy danh sách nhân viên (staff)
// @route   GET /api/admin/staff
// @access  Private/Admin
export const getStaff = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ''

    // Tìm các role nhân viên: inventory, service, sale
    const staffRoles = await Role.find({ role_name: { $in: ['inventory', 'service', 'sale'] } })
    const staffRoleIds = staffRoles.map(role => role._id)

    if (!staffRoles.length) {
        res.status(404)
        throw new Error('Chưa có role nhân viên (inventory, service, sale) nào trong hệ thống')
    }

    const query = {
        role_id: { $in: staffRoleIds },
        $or: [
            { full_name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
        ],
    }

    const total = await User.countDocuments(query)
    const users = await User.find(query)
        .select('-password')
        .populate('role_id', 'role_name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })

    // Join với Employee để lấy thông tin chi tiết
    const staff = await Promise.all(
        users.map(async (user) => {
            const emp = await Employee.findOne({ user_id: user._id })
            return {
                ...user.toObject(),
                position: emp ? emp.position : null,
                salary: emp ? parseFloat(emp.salary) : null,
                hired_date: emp ? emp.hired_date : null,
            }
        })
    )

    res.json({
        staff,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    })
})

// @desc    Lấy chi tiết nhân viên
// @route   GET /api/admin/staff/:id
// @access  Private/Admin
export const getStaffById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('-password')
        .populate('role_id', 'role_name')

    if (!user) {
        res.status(404)
        throw new Error('Nhân viên không tồn tại')
    }

    const staffRoles = await Role.find({ role_name: { $in: ['inventory', 'service', 'sale'] } })
    const staffRoleIds = staffRoles.map(role => role._id.toString())

    if (!staffRoleIds.includes(user.role_id._id.toString())) {
        res.status(400)
        throw new Error('Người dùng này không phải là nhân viên')
    }

    const emp = await Employee.findOne({ user_id: user._id })
    const staff = {
        ...user.toObject(),
        position: emp ? emp.position : null,
        salary: emp ? parseFloat(emp.salary) : null,
        hired_date: emp ? emp.hired_date : null,
    }

    res.json(staff)
})

// @desc    Tạo nhân viên mới
// @route   POST /api/admin/staff
// @access  Private/Admin
export const createStaff = asyncHandler(async (req, res) => {
    const { username, password, email, phone, full_name, position, salary, hired_date } = req.body

    // Validate
    if (!username || !password || !email || !phone || !full_name || !position || !salary || !hired_date) {
        res.status(400)
        throw new Error('Vui lòng nhập đầy đủ thông tin')
    }

    // Kiểm tra tồn tại
    const exists = await User.findOne({ $or: [{ email }, { username }, { phone }] })
    if (exists) {
        res.status(400)
        throw new Error('Email, tên đăng nhập hoặc số điện thoại đã được sử dụng')
    }

    // Tìm role tương ứng với position (inventory / service / sale)
    // Lưu ý: Position ở frontend gửi lên: 'inventory' | 'service' | 'sale'
    const targetRoleName = position;
    const targetRole = await Role.findOne({ role_name: targetRoleName })

    if (!targetRole) {
        res.status(404)
        throw new Error(`Vai trò ${targetRoleName} không tồn tại trong hệ thống`)
    }

    // Tạo user
    const user = await User.create({
        username,
        password,
        email,
        phone,
        full_name,
        full_name,
        role_id: targetRole._id,
        status: 'active',
    })

    // Tạo employee record
    const employee = await Employee.create({
        user_id: user._id,
        position,
        salary: parseFloat(salary),
        hired_date: new Date(hired_date),
    })

    res.status(201).json({
        message: 'Tạo nhân viên thành công',
        staff: {
            _id: user._id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            position: employee.position,
            salary: parseFloat(employee.salary),
            hired_date: employee.hired_date,
        },
    })
})

// @desc    Cập nhật nhân viên
// @route   PUT /api/admin/staff/:id
// @access  Private/Admin
export const updateStaff = asyncHandler(async (req, res) => {
    const { full_name, email, phone, position, salary, hired_date, status } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
        res.status(404)
        throw new Error('Nhân viên không tồn tại')
    }

    const staffRoles = await Role.find({ role_name: { $in: ['inventory', 'service', 'sale'] } })
    const staffRoleIds = staffRoles.map(role => role._id.toString())

    if (!staffRoleIds.includes(user.role_id.toString())) {
        res.status(400)
        throw new Error('Không thể cập nhật: không phải nhân viên')
    }

    // Nếu thay đổi position -> Cần update role_id tương ứng
    if (position && position !== (await Employee.findOne({ user_id: user._id }))?.position) {
        const newRole = await Role.findOne({ role_name: position })
        if (newRole) {
            user.role_id = newRole._id
        }
    }

    // Cập nhật user
    user.full_name = full_name || user.full_name
    user.email = email || user.email
    user.phone = phone || user.phone
    user.status = status || user.status

    const updatedUser = await user.save()

    // Cập nhật employee
    let updatedEmp = await Employee.findOne({ user_id: user._id })
    if (updatedEmp) {
        updatedEmp.position = position || updatedEmp.position
        updatedEmp.salary = salary ? parseFloat(salary) : updatedEmp.salary
        updatedEmp.hired_date = hired_date ? new Date(hired_date) : updatedEmp.hired_date
        await updatedEmp.save()
    }

    res.json({
        message: 'Cập nhật nhân viên thành công',
        staff: {
            _id: updatedUser._id,
            username: updatedUser.username,
            full_name: updatedUser.full_name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            position: updatedEmp ? updatedEmp.position : null,
            salary: updatedEmp ? parseFloat(updatedEmp.salary) : null,
            hired_date: updatedEmp ? updatedEmp.hired_date : null,
            status: updatedUser.status,
        },
    })
})

// @desc    Xóa (vô hiệu hóa) nhân viên
// @route   DELETE /api/admin/staff/:id
// @access  Private/Admin
export const deleteStaff = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) {
        res.status(404)
        throw new Error('Nhân viên không tồn tại')
    }

    const staffRoles = await Role.find({ role_name: { $in: ['inventory', 'service', 'sale'] } })
    const staffRoleIds = staffRoles.map(role => role._id.toString())

    if (!staffRoleIds.includes(user.role_id.toString())) {
        res.status(400)
        throw new Error('Không thể xóa: không phải nhân viên')
    }

    // Đổi status thành suspended
    user.status = 'suspended'
    await user.save()

    res.json({ message: 'Đã vô hiệu hóa nhân viên' })
})