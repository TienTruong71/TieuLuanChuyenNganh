// routes/profileRoutes.js
import express from 'express';
import { getProfile, updateProfile } from '../../controllers/client/profile.controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getProfile)
  .put(protect, updateProfile);

export default router;
