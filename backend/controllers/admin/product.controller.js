import asyncHandler from 'express-async-handler'
import Product from '../../models/productModel.js'
import mongoose from 'mongoose'

// @desc    Lấy TẤT CẢ sản phẩm (kèm tồn kho Admin + tồn kho Showroom)
// @route   GET /api/admin/products
// @access  Private (Manager)
export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.aggregate([
    {
      $lookup: {
        from: 'inventories',       // Collection 'inventories'
        localField: '_id',
        foreignField: 'product_id',
        as: 'inventory_data'
      }
    },
    {
      $lookup: {
        from: 'categories',        // Collection 'categories'
        localField: 'category_id',
        foreignField: '_id',
        as: 'category_doc'
      }
    },
    {
      $addFields: {
        // Lấy quantity_available từ mảng inventory_data (nếu ko có thì = 0)
        inventory_quantity: {
          $ifNull: [{ $arrayElemAt: ["$inventory_data.quantity_available", 0] }, 0]
        },
        // Mô phỏng populate: thay thế category_id bằng object category
        category_id: { $arrayElemAt: ["$category_doc", 0] }
      }
    },
    {
      $project: {
        inventory_data: 0, // Ẩn mảng tạm
        category_doc: 0
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);

  res.json(products);
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

  if (!category_id || !product_name || !price || !type) {
    res.status(400)
    throw new Error('Thiếu thông tin bắt buộc của sản phẩm')
  }

  const product = new Product({
    category_id,
    product_name,
    description,
    price,
    stock_quantity: stock_quantity || 0,
    type,
    images: images || [],
  })

  const createdProduct = await product.save()
  res.status(201).json(createdProduct)
})

// @desc    Cập nhật sản phẩm
// @route   PUT /api/admin/products/:id
// @access  Private (Manager)
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { product_name, description, price, stock_quantity, type, images } = req.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Product ID không hợp lệ')
  }

  const product = await Product.findById(id)
  if (!product) {
    res.status(404)
    throw new Error('Sản phẩm không tồn tại')
  }

  product.product_name = product_name || product.product_name
  product.description = description || product.description
  product.price = price || product.price
  product.stock_quantity = stock_quantity !== undefined ? stock_quantity : product.stock_quantity
  product.type = type || product.type
  product.images = images || product.images

  const updatedProduct = await product.save()
  res.json(updatedProduct)
})

// @desc    Xóa sản phẩm
// @route   DELETE /api/admin/products/:id
// @access  Private (Manager)
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Product ID không hợp lệ')
  }

  const product = await Product.findById(id)
  if (!product) {
    res.status(404)
    throw new Error('Sản phẩm không tồn tại')
  }

  await product.deleteOne()
  res.json({ message: 'Sản phẩm đã được xóa' })
})