// controllers/profileController.js
import asyncHandler from 'express-async-handler';
import User from '../../models/userModel.js';
import bcrypt from 'bcryptjs';

// @desc    Lấy thông tin cá nhân của người dùng
// @route   GET /api/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('Người dùng không tồn tại');
  }
});

// @desc    Cập nhật thông tin cá nhân
// @route   PUT /api/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('Người dùng không tồn tại');
  }

  const { full_name, email, phone, address, currentPassword, newPassword } = req.body;

  // Cập nhật thông tin cơ bản
  if (full_name) user.full_name = full_name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  // Đổi password 
  if (newPassword) {
    if (!currentPassword) {
      res.status(400);
      throw new Error('Cần nhập mật khẩu hiện tại để đổi mật khẩu');
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error('Mật khẩu hiện tại không đúng');
    }

    user.password = newPassword; 
  }

  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id,
    username: updatedUser.username,
    full_name: updatedUser.full_name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    address: updatedUser.address,
    role_id: updatedUser.role_id,
    status: updatedUser.status,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  });
});
