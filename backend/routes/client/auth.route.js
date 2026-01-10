import express from 'express'
import {
  loginUser,
  registerUser,
  getMe,
  verifyEmailOTP,
  resendEmailOTP,
  loginWithGoogle,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyResetToken,
} from '../../controllers/client/auth.controller.js'
import { protect } from '../../middleware/authMiddleware.js'

const router = express.Router()

router.post('/login', loginUser)
router.post('/register', registerUser)
router.post('/verify-email-otp', verifyEmailOTP)
router.post('/resend-email-otp', resendEmailOTP)
router.post('/google-login', loginWithGoogle)
router.get('/me', protect, getMe)

router.put('/change-password', protect, changePassword)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/verify-reset-token', verifyResetToken)

export default router