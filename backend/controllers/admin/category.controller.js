// backend/controllers/admin/category.controller.js
import Category from '../../models/categoryModel.js'
import asyncHandler from 'express-async-handler'

// @desc    Lấy toàn bộ category
// @route   GET /api/admin/categories
// @access  Private/Admin
export const getCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const search = req.query.search || ''

  const query = {
    $or: [
      { category_name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ],
  }

  const total = await Category.countDocuments(query)
  const categories = await Category.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 })

  res.json({
    categories,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
})

// @desc    Lấy chi tiết category
// @route   GET /api/admin/categories/:id
// @access  Private/Admin
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) {
    res.status(404)
    throw new Error('Danh mục không tồn tại')
  }
  res.json(category)
})

// @desc    Thêm mới category
// @route   POST /api/admin/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { category_name, description, image } = req.body

  // Validate
  if (!category_name) {
    res.status(400)
    throw new Error('Vui lòng nhập tên danh mục')
  }

  const exists = await Category.findOne({ category_name })
  if (exists) {
    res.status(400)
    throw new Error('Tên danh mục đã tồn tại')
  }

  const category = await Category.create({
    category_name,
    description: description || '',
    image: image || '',
  })

  res.status(201).json({
    message: 'Tạo danh mục thành công',
    category,
  })
})

// @desc    Cập nhật category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const { category_name, description, image } = req.body

  const category = await Category.findById(req.params.id)
  if (!category) {
    res.status(404)
    throw new Error('Danh mục không tồn tại')
  }

  // Kiểm tra tên trùng (nếu đổi tên)
  if (category_name && category_name !== category.category_name) {
    const exists = await Category.findOne({ category_name })
    if (exists) {
      res.status(400)
      throw new Error('Tên danh mục đã tồn tại')
    }
  }

  category.category_name = category_name || category.category_name
  category.description = description !== undefined ? description : category.description
  category.image = image !== undefined ? image : category.image

  const updated = await category.save()

  res.json({
    message: 'Cập nhật danh mục thành công',
    category: updated,
  })
})

// @desc    Xóa category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) {
    res.status(404)
    throw new Error('Danh mục không tồn tại')
  }

  await category.deleteOne()
  res.json({ message: 'Xóa danh mục thành công' })
})