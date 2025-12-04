// backend/controllers/client/auth.controller.js
import User from '../../models/userModel.js'
import Role from '../../models/roleModel.js'
import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// @desc    Đăng nhập chung (Admin, Staff, Customer)
// @route   POST /api/client/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    // Tìm user + populate role
    const user = await User.findOne({ email }).populate('role_id', 'role_name')

    if (!user || !(await user.matchPassword(password))) {
        res.status(401)
        throw new Error('Email hoặc mật khẩu không đúng')
    }

    if (user.status !== 'active') {
        res.status(403)
        throw new Error('Tài khoản đã bị khóa')
    }

    const isAdmin = user.role_id?.role_name === 'admin' || user.role_id?.role_name === 'manager'

    res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role_id.role_name,
        isAdmin: isAdmin,  // ✅ ĐÚNG
        token: generateToken(user._id),
    })
})

// @desc    Đăng ký tài khoản mới (Customer)
// @route   POST /api/client/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, full_name, phone } = req.body

    // Validate input
    if (!email || !username || !password) {
        res.status(400)
        throw new Error('Vui lòng điền đầy đủ thông tin')
    }

    // Kiểm tra email đã tồn tại
    const emailExists = await User.findOne({ email })
    if (emailExists) {
        res.status(400)
        throw new Error('Email đã được sử dụng')
    }

    // Kiểm tra username đã tồn tại
    const usernameExists = await User.findOne({ username })
    if (usernameExists) {
        res.status(400)
        throw new Error('Tên đăng nhập đã được sử dụng')
    }

    // Tìm role Customer (hoặc tạo default role)
    let customerRole = await Role.findOne({ role_name: 'Customer' })
    if (!customerRole) {
        // Nếu không có role Customer, tạo mới
        customerRole = await Role.create({ role_name: 'Customer' })
    }

    // Tạo user mới
    const user = await User.create({
        email,
        username,
        password, // sẽ được hash trong pre-save hook của model
        full_name: full_name || username,
        phone: phone || '',
        role_id: customerRole._id,
        status: 'active',
        isAdmin: false,
    })

    if (user) {
        // Populate role để trả về đầy đủ thông tin
        await user.populate('role_id', 'role_name')

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role_id.role_name,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        })
    } else {
        res.status(400)
        throw new Error('Dữ liệu không hợp lệ')
    }
})

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/client/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select('-password')
        .populate('role_id', 'role_name')
    res.json(user)
})