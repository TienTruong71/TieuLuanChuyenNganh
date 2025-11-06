// backend/controllers/client/auth.controller.js
import User from '../../models/userModel.js'
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

    res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role_id.role_name,
        isAdmin: user.isAdmin || false,
        token: generateToken(user._id),
    })
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