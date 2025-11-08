// backend/routes/client/auth.routes.js
import express from 'express'
import { loginUser, getMe } from '../../controllers/client/auth.controller.js'
import { protect } from '../../middleware/authMiddleware.js'

const router = express.Router()

router.post('/login', loginUser)

router.get('/me', protect, getMe)

export default router