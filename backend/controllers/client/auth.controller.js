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
    authProvider: user.authProvider || 'local', // ⬅️ THÊM authProvider
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
    emailOTPExpire: Date.now() + 10 * 60 * 1000,
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

  let customerRole = await Role.findOne({ role_name: 'Customer' })
  if (!customerRole) {
    customerRole = await Role.create({ role_name: 'Customer' })
  }

  if (!user) {
    // ✅ TẠO MẬT KHẨU RANDOM CHO USER MỚI
    const randomPassword = crypto.randomBytes(16).toString('hex') // Tạo password random 32 ký tự

    user = await User.create({
      email,
      username: email.split('@')[0],
      full_name: name,
      avatar: picture,
      googleId,
      password: randomPassword, // ⬅️ THÊM PASSWORD RANDOM
      role_id: customerRole._id,
      authProvider: 'google',
      isEmailVerified: true,
      status: 'active',
    })

    // Gán object role vào user để trả về response đúng định dạng
    user.role_id = customerRole
  }

  // ✅ Fix lỗi: Nếu user tồn tại nhưng mất role (role_id == null) -> gán lại Customer
  if (!user.role_id) {
    user.role_id = customerRole._id
    await user.save()
    user.role_id = customerRole // Cập nhật object in-memory
  }

  if (user && !user.googleId) {
    user.googleId = googleId
    user.authProvider = 'google'
    user.isEmailVerified = true

    if (!user.password) {
      user.password = crypto.randomBytes(16).toString('hex')
    }

    await user.save()
  }

  // Check status for Google login users
  if (user.status !== 'active') {
    res.status(403)
    throw new Error('Tài khoản đã bị khóa hoặc chưa kích hoạt')
  }

  // user.role_id lúc này chắc chắn là object (do populate hoặc gán thủ công ở trên)
  const isAdmin =
    user.role_id?.role_name === 'admin' ||
    user.role_id?.role_name === 'manager'

  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    avatar: user.avatar,
    role: user.role_id?.role_name || 'Customer', // Fallback an toàn
    isAdmin,
    authProvider: user.authProvider,
    token: generateToken(user._id),
  })
})

// =====================================================
// =====================================================
export const changePassword = asyncHandler(async (req, res) => {
  console.log('changePassword function called')
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    res.status(400)
    throw new Error('Vui lòng điền đầy đủ thông tin')
  }

  if (newPassword.length < 6) {
    res.status(400)
    throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự')
  }

  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('Không tìm thấy người dùng')
  }

  // if (user.authProvider === 'google') {
  //   res.status(400)
  //   throw new Error('Tài khoản đăng nhập bằng Google không thể đổi mật khẩu...')
  // }

  // Kiểm tra mật khẩu hiện tại
  const isPasswordMatch = await user.matchPassword(currentPassword)
  if (!isPasswordMatch) {
    res.status(401)
    throw new Error('Mật khẩu hiện tại không đúng')
  }

  // Kiểm tra mật khẩu mới không trùng cũ
  const isSamePassword = await user.matchPassword(newPassword)
  if (isSamePassword) {
    res.status(400)
    throw new Error('Mật khẩu mới không được trùng với mật khẩu hiện tại')
  }

  // Cập nhật mật khẩu
  user.password = newPassword
  await user.save()

  res.json({
    message: 'Đổi mật khẩu thành công',
  })
})

// =====================================================
// QUÊN MẬT KHẨU - GỬI EMAIL RESET
// =====================================================
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    res.status(400)
    throw new Error('Vui lòng nhập email')
  }

  const user = await User.findOne({ email })

  if (!user) {
    res.status(404)
    throw new Error('Không tìm thấy tài khoản với email này')
  }

  // Tạo reset token (JWT với expire 5 phút)
  const resetToken = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      purpose: 'reset_password' // Để bảo mật hơn
    },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  )

  // Lưu token vào DB (để có thể revoke nếu cần)
  user.passwordResetToken = resetToken
  user.passwordResetExpire = Date.now() + 5 * 60 * 1000 // 5 phút
  await user.save()

  // Tạo link reset
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

  try {
    await sendEmail({
      to: user.email,
      subject: 'Đặt lại mật khẩu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Đặt lại mật khẩu</h2>
          <p>Xin chào <strong>${user.full_name || user.username}</strong>,</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu. Click vào nút bên dưới để tiếp tục:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Đặt lại mật khẩu
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            ⚠️ Link này chỉ có hiệu lực trong <strong>5 phút</strong>.
          </p>
          <p style="color: #666; font-size: 14px;">
            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            Hoặc copy link này vào trình duyệt:<br>
            <span style="word-break: break-all;">${resetUrl}</span>
          </p>
        </div>
      `,
    })

    res.json({
      message: 'Link đặt lại mật khẩu đã được gửi đến email của bạn',
    })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpire = undefined
    await user.save()

    console.error('Error sending email:', error)
    res.status(500)
    throw new Error('Không thể gửi email. Vui lòng thử lại sau')
  }
})

// =====================================================
// ĐẶT LẠI MẬT KHẨU - VERIFY TOKEN VÀ ĐỔI MẬT KHẨU
// =====================================================
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body

  if (!token || !newPassword) {
    res.status(400)
    throw new Error('Thiếu thông tin')
  }

  if (newPassword.length < 6) {
    res.status(400)
    throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự')
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.purpose !== 'reset_password') {
      res.status(401)
      throw new Error('Token không hợp lệ')
    }

    // Tìm user và kiểm tra token trong DB
    const user = await User.findOne({
      _id: decoded.userId,
      passwordResetToken: token,
      passwordResetExpire: { $gt: Date.now() }, // Kiểm tra còn hiệu lực
    })

    if (!user) {
      res.status(401)
      throw new Error('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')
    }

    // Kiểm tra mật khẩu mới không trùng cũ
    const isSamePassword = await user.matchPassword(newPassword)
    if (isSamePassword) {
      res.status(400)
      throw new Error('Mật khẩu mới không được trùng với mật khẩu cũ')
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword
    user.passwordResetToken = undefined
    user.passwordResetExpire = undefined
    await user.save()

    res.json({
      message: 'Đặt lại mật khẩu thành công',
    })
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401)
      throw new Error('Link đặt lại mật khẩu đã hết hạn')
    }
    if (error.name === 'JsonWebTokenError') {
      res.status(401)
      throw new Error('Link đặt lại mật khẩu không hợp lệ')
    }
    throw error
  }
})

// =====================================================
// VERIFY RESET TOKEN - Để frontend check token hợp lệ
// =====================================================
export const verifyResetToken = asyncHandler(async (req, res) => {
  const { token } = req.body

  if (!token) {
    res.status(400)
    throw new Error('Thiếu token')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findOne({
      _id: decoded.userId,
      passwordResetToken: token,
      passwordResetExpire: { $gt: Date.now() },
    })

    if (!user) {
      res.status(401)
      throw new Error('Link không hợp lệ hoặc đã hết hạn')
    }

    res.json({
      valid: true,
      email: user.email,
    })
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401)
      throw new Error('Link đã hết hạn')
    }
    res.status(401)
    throw new Error('Link không hợp lệ')
  }
})