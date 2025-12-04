import asyncHandler from 'express-async-handler'
import Product from '../../models/productModel.js'
import Category from '../../models/categoryModel.js'
import mongoose from 'mongoose'

// @desc    Lấy danh sách danh mục
// @route   GET /api/admin/categories
// @access  Private (Manager)
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({})
  res.json(categories)
})

// @desc    Tạo danh mục mới
// @route   POST /api/admin/categories
// @access  Private (Manager)
export const createCategory = asyncHandler(async (req, res) => {
  const { category_name, description, image } = req.body

  if (!category_name) {
    res.status(400)
    throw new Error('Tên danh mục là bắt buộc')
  }

  const categoryExists = await Category.findOne({ category_name })
  if (categoryExists) {
    res.status(400)
    throw new Error('Danh mục đã tồn tại')
  }

  const category = new Category({
    category_name,
    description,
    image: image || '',
  })

  const createdCategory = await category.save()
  res.status(201).json(createdCategory)
})

// @desc    Cập nhật danh mục
// @route   PUT /api/admin/categories/:id
// @access  Private (Manager)
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { category_name, description, image } = req.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Category ID không hợp lệ')
  }

  const category = await Category.findById(id)
  if (!category) {
    res.status(404)
    throw new Error('Danh mục không tồn tại')
  }

  // Check duplicate name (nếu đổi tên)
  if (category_name && category_name !== category.category_name) {
    const existingCategory = await Category.findOne({ category_name })
    if (existingCategory) {
      res.status(400)
      throw new Error('Tên danh mục đã tồn tại')
    }
  }

  category.category_name = category_name || category.category_name
  category.description = description !== undefined ? description : category.description
  category.image = image !== undefined ? image : category.image

  const updatedCategory = await category.save()
  res.json(updatedCategory)
})

// @desc    Xóa danh mục
// @route   DELETE /api/admin/categories/:id
// @access  Private (Manager)
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Category ID không hợp lệ')
  }

  const category = await Category.findById(id)
  if (!category) {
    res.status(404)
    throw new Error('Danh mục không tồn tại')
  }

  // Check if category has products
  const productsCount = await Product.countDocuments({ category_id: id })
  if (productsCount > 0) {
    res.status(400)
    throw new Error(`Không thể xóa danh mục này vì còn ${productsCount} sản phẩm. Vui lòng xóa hoặc chuyển sản phẩm sang danh mục khác trước.`)
  }

  await category.deleteOne()
  res.json({ message: 'Đã xóa danh mục thành công' })
})