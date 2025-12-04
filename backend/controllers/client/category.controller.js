// controllers/client/category.controller.js
import asyncHandler from 'express-async-handler'
import Category from '../../models/categoryModel.js'

// @desc    Lấy danh sách categories (Public)
// @route   GET /api/client/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ createdAt: -1 })
  res.json(categories)
})