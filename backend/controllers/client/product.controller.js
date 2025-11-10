import asyncHandler from 'express-async-handler'
import Product from '../../models/productModel.js'

/**
 * @desc    Lấy danh sách sản phẩm (có phân trang, lọc, sắp xếp, populate category)
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  let { page, limit, category, minPrice, maxPrice, sortBy, order } = req.query

  // --- Pagination ---
  page = parseInt(page) || 1
  limit = parseInt(limit) || 10
  const skip = (page - 1) * limit

  // --- Build filter ---
  const filter = {}
  if (category) filter.category_id = category
  if (minPrice || maxPrice) {
    filter.price = {}
    if (minPrice) filter.price.$gte = parseFloat(minPrice)
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
  }

  // --- Build sort ---
  const sortOptions = {}
  if (sortBy) {
    const sortField = sortBy
    const sortOrder = order === 'desc' ? -1 : 1
    sortOptions[sortField] = sortOrder
  }

  // --- Query products ---
  const products = await Product.find(filter)
    .populate('category_id', 'category_name') // lấy tên danh mục
    .select('product_name price images type category_id')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)

  if (!products || products.length === 0) {
    res.status(404)
    throw new Error('Không có sản phẩm')
  }

  const total = await Product.countDocuments(filter)
  const totalPages = Math.ceil(total / limit)

  res.json({
    page,
    totalPages,
    limit,
    total,
    products,
  })
})

/**
 * @desc    Lấy chi tiết sản phẩm theo ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category_id', 'category_name')

  if (product) {
    res.json(product)
  } else {
    res.status(404)
    throw new Error('Sản phẩm không tồn tại')
  }
})
