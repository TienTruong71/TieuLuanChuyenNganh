// controllers/client/category.controller.js
import asyncHandler from 'express-async-handler'
import Category from '../../models/categoryModel.js'

// @desc    Lấy danh sách categories (Public)
// @route   GET /api/client/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.current || req.query.page) || 1;
  const limit = parseInt(req.query.pageSize || req.query.limit) || 12;
  const search = req.query.search || '';
  const sortField = req.query.sortField || 'createdAt';
  const sortOrder = (req.query.sortOrder === 'ascend' || req.query.sortOrder === 'asc') ? 1 : -1;

  let filter = {};
  if (search) {
    filter.$or = [
      { category_name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const sortObj = {};
  sortObj[sortField] = sortOrder;

  const total = await Category.countDocuments(filter);
  const categories = await Category.find(filter)
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    categories,
    pagination: {
      current: page,
      pageSize: limit,
      total
    }
  });
})