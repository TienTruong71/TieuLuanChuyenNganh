import express from 'express'
import { loginUser, registerUser, getMe } from '../../controllers/client/auth.controller.js'
import { protect } from '../../middleware/authMiddleware.js'

const router = express.Router()

// @route   POST /api/client/auth/login
// @desc    Đăng nhập
// @access  Public
router.post('/login', loginUser)

// @route   POST /api/client/auth/register
// @desc    Đăng ký tài khoản mới
// @access  Public
router.post('/register', registerUser)

// @route   GET /api/client/auth/me
// @desc    Lấy thông tin user hiện tại
// @access  Private
router.get('/me', protect, getMe)

export default router