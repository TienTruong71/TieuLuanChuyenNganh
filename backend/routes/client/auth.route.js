import express from 'express'
import { loginUser,registerUser,getMe,verifyEmailOTP,resendEmailOTP, } from '../../controllers/client/auth.controller.js'
import { protect } from '../../middleware/authMiddleware.js'

const router = express.Router()

router.post('/login', loginUser)
router.post('/register', registerUser)

router.post('/verify-email-otp', verifyEmailOTP)
router.post('/resend-email-otp', resendEmailOTP)

router.get('/me', protect, getMe)


export default router