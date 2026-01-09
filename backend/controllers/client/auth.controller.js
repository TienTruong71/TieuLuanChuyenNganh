import User from '../../models/userModel.js'
import Role from '../../models/roleModel.js'
import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import sendEmail from '../../utils/sendEmail.js'
import { OAuth2Client } from 'google-auth-library'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

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



  // Chỉ bắt OTP nếu user đang ở trạng thái 'inactive' (vừa đăng ký xong)
  if (!user.isEmailVerified && user.status === 'inactive') {
    res.status(403)
    throw new Error('Vui lòng xác nhận email bằng OTP')
  }

  if (user.status !== 'active') {
    res.status(403)
    throw new Error('Tài khoản đã bị khóa hoặc chưa kích hoạt')
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


  try {
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
  } catch (error) {
    console.log('Error sending email:', error.message)
    // Nếu gửi mail lỗi, có thể xóa user vừa tạo để tránh rác
    // await User.findByIdAndDelete(user._id)
    // throw new Error('Không thể gửi email OTP. Vui lòng thử lại sau.')
  }

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

export const loginWithGoogle = asyncHandler(async (req, res) => {
  const { idToken } = req.body

  if (!idToken) {
    res.status(400)
    throw new Error('Thiếu Google ID Token')
  }

  // Verify token từ Google
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()
  const {
    sub: googleId,
    email,
    name,
    picture,
  } = payload

  let user = await User.findOne({ email }).populate('role_id', 'role_name')

  // Lấy role Customer
  let customerRole = await Role.findOne({ role_name: 'Customer' })
  if (!customerRole) {
    customerRole = await Role.create({ role_name: 'Customer' })
  }

  // Nếu chưa có user → tạo mới
  if (!user) {
    user = await User.create({
      email,
      username: email.split('@')[0],
      full_name: name,
      avatar: picture,
      googleId,
      role_id: customerRole._id,
      authProvider: 'google',
      isEmailVerified: true,
      status: 'active',
    })
  }

  // Nếu user tồn tại nhưng trước đó đăng ký thường
  if (user && !user.googleId) {
    user.googleId = googleId
    user.authProvider = 'google'
    user.isEmailVerified = true
    await user.save()
  }

  // Check status for Google login users
  if (user.status !== 'active') {
    res.status(403)
    throw new Error('Tài khoản đã bị khóa hoặc chưa kích hoạt')
  }

  const isAdmin =
    user.role_id?.role_name === 'admin' ||
    user.role_id?.role_name === 'manager'

  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    avatar: user.avatar,
    role: user.role_id.role_name,
    isAdmin,
    token: generateToken(user._id),
  })
})
