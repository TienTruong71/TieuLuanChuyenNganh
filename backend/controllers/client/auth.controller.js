import User from '../../models/userModel.js'
import Role from '../../models/roleModel.js'
import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import sendEmail from '../../utils/sendEmail.js'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })
}


export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).populate('role_id', 'role_name')

  if (!user || !(await user.matchPassword(password))) {
    res.status(401)
    throw new Error('Email hoặc mật khẩu không đúng')
  }

  if (!user.isEmailVerified) {
    res.status(403)
    throw new Error('Vui lòng xác nhận email bằng OTP')
  }

  if (user.status !== 'active') {
    res.status(403)
    throw new Error('Tài khoản đã bị khóa')
  }

  const isAdmin =
    user.role_id?.role_name === 'admin' ||
    user.role_id?.role_name === 'manager'

  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    role: user.role_id.role_name,
    isAdmin,
    token: generateToken(user._id),
  })
})


export const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, full_name, phone } = req.body

  if (!email || !username || !password || !phone) {
    res.status(400)
    throw new Error('Vui lòng điền đầy đủ thông tin')
  }

  if (await User.findOne({ email })) throw new Error('Email đã tồn tại')
  if (await User.findOne({ username })) throw new Error('Username đã tồn tại')

  let customerRole = await Role.findOne({ role_name: 'Customer' })
  if (!customerRole) {
    customerRole = await Role.create({ role_name: 'Customer' })
  }

 
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex')

  const user = await User.create({
    email,
    username,
    password,
    phone,
    full_name,
    role_id: customerRole._id,

    status: 'inactive',
    isEmailVerified: false,
    emailOTP: otpHash,
    emailOTPExpire: Date.now() + 10 * 60 * 1000, // 10 phút
  })

 
  await sendEmail({
    to: user.email,
    subject: 'Mã OTP xác nhận đăng ký',
    html: `
      <h3>Xin chào ${user.full_name}</h3>
      <p>Mã OTP xác nhận email của bạn là:</p>
      <h2 style="color:red">${otp}</h2>
      <p>Mã có hiệu lực trong 10 phút</p>
    `,
  })

  res.status(201).json({
    message: 'Đăng ký thành công. Vui lòng nhập OTP được gửi qua email.',
    email: user.email,
  })
})


export const verifyEmailOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    res.status(400)
    throw new Error('Thiếu email hoặc OTP')
  }

  const otpHash = crypto.createHash('sha256').update(otp).digest('hex')

  const user = await User.findOne({
    email,
    emailOTP: otpHash,
    emailOTPExpire: { $gt: Date.now() },
  })

  if (!user) {
    res.status(400)
    throw new Error('OTP không hợp lệ hoặc đã hết hạn')
  }

  user.isEmailVerified = true
  user.status = 'active'
  user.emailOTP = undefined
  user.emailOTPExpire = undefined

  await user.save()

  res.json({
    message: 'Xác nhận email thành công. Bạn có thể đăng nhập.',
  })
})


export const resendEmailOTP = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) throw new Error('Không tìm thấy tài khoản')
  if (user.isEmailVerified) throw new Error('Email đã được xác nhận')

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex')

  user.emailOTP = otpHash
  user.emailOTPExpire = Date.now() + 10 * 60 * 1000
  await user.save()

  await sendEmail({
    to: user.email,
    subject: 'Mã OTP xác nhận email (gửi lại)',
    html: `
      <h3>Mã OTP mới của bạn</h3>
      <h2 style="color:red">${otp}</h2>
      <p>Có hiệu lực trong 10 phút</p>
    `,
  })

  res.json({ message: 'OTP mới đã được gửi' })
})


export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('role_id', 'role_name')

  res.json(user)
})
