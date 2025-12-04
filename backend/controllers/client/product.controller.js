import asyncHandler from 'express-async-handler'
import Product from '../../models/productModel.js'
import mongoose from 'mongoose'

// @desc    Lấy danh sách sản phẩm
// @route   GET /api/client/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice } = req.query

  let filter = {}
  if (category) filter.category_id = category
  if (minPrice || maxPrice) {
    filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)
  }

  const products = await Product.find(filter)
    .populate('category_id', 'category_name image')
    .sort({ createdAt: -1 })

  res.json(products)
})

// @desc    Lấy chi tiết sản phẩm theo ID
// @route   GET /api/client/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params

  console.log('🔍 Getting product by ID:', id)

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error('❌ Invalid product ID:', id)
    res.status(400)
    throw new Error('Product ID không hợp lệ')
  }

  const product = await Product.findById(id)
    .populate('category_id', 'category_name image')

  if (!product) {
    console.error('❌ Product not found:', id)
    res.status(404)
    throw new Error('Không tìm thấy sản phẩm')
  }

  console.log('✅ Product found:', {
    id: product._id,
    name: product.product_name,
    images: product.images,
    hasImages: !!product.images,
    imagesLength: product.images?.length,
  })

  res.json(product)
})

// @desc    Lấy TẤT CẢ sản phẩm
// @route   GET /api/admin/products
// @access  Private (Manager)
export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate('category_id', 'category_name')
  res.json(products)
})

// @desc    Lấy danh sách sản phẩm theo category
// @route   GET /api/admin/products/:categoryId
// @access  Private (Manager)
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    res.status(400)
    throw new Error('Category ID không hợp lệ')
  }

  const products = await Product.find({ category_id: categoryId })
  res.json(products)
})

// @desc    Thêm sản phẩm mới
// @route   POST /api/admin/products
// @access  Private (Manager)
export const createProduct = asyncHandler(async (req, res) => {
  const {
    category_id,
    product_name,
    description,
    price,
    stock_quantity,
    type,
    images,
  } = req.body

  // Validation
  if (!product_name) {
    res.status(400)
    throw new Error('Tên sản phẩm là bắt buộc')
  }

  if (!price || price <= 0) {
    res.status(400)
    throw new Error('Giá sản phẩm phải lớn hơn 0')
  }

  // Nếu đang ở mode "Theo danh mục" thì category_id bắt buộc
  if (category_id && !mongoose.Types.ObjectId.isValid(category_id)) {
    res.status(400)
    throw new Error('Category ID không hợp lệ')
  }

  const product = new Product({
    category_id: category_id || null, // Cho phép null nếu chưa chọn category
    product_name,
    description: description || '',
    price,
    stock_quantity: stock_quantity || 0,
    type: type || 'product',
    images: images || [],
  })

  const createdProduct = await product.save()
  res.status(201).json(createdProduct)
})