import asyncHandler from 'express-async-handler'
import Product from '../../models/productModel.js'
import mongoose from 'mongoose'

// @desc    Lấy TẤT CẢ sản phẩm (kèm tồn kho Admin + tồn kho Showroom)
// @route   GET /api/admin/products
// @access  Private (Manager)
export const getAllProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.current || req.query.page) || 1;
  const limit = parseInt(req.query.pageSize || req.query.limit) || 10;
  const search = req.query.search || '';
  const sortField = req.query.sortField || 'createdAt';
  const sortOrder = (req.query.sortOrder === 'ascend' || req.query.sortOrder === 'asc') ? 1 : -1;

  const pipeline = [];

  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { product_name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      }
    });
  }

  pipeline.push(
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
        category_id: { $arrayElemAt: ["$category_doc", 0] },
        cleanPrice: {
          $cond: {
            if: { $eq: [{ $type: "$price" }, "object"] },
            then: { $toDouble: { $getField: { field: { $literal: "$numberDecimal" }, input: "$price" } } },
            else: { $toDouble: "$price" }
          }
        }
      }
    },
    {
      $project: {
        inventory_data: 0, // Ẩn mảng tạm
        category_doc: 0,
        cleanPrice: 0
      }
    }
  );

  const sortObj = {};
  sortObj[sortField === 'price' ? 'cleanPrice' : sortField] = sortOrder;
  pipeline.push({ $sort: sortObj });

  pipeline.push({
    $facet: {
      metadata: [{ $count: "total" }],
      data: [{ $skip: (page - 1) * limit }, { $limit: limit }]
    }
  });

  const result = await Product.aggregate(pipeline);
  const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;
  const products = result[0].data;

  res.json({
    products,
    pagination: {
      current: page,
      pageSize: limit,
      total
    }
  });
})

// @desc    Lấy danh sách sản phẩm theo category
// @route   GET /api/admin/products/:categoryId
// @access  Private (Manager)
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const page = parseInt(req.query.current || req.query.page) || 1;
  const limit = parseInt(req.query.pageSize || req.query.limit) || 10;
  const search = req.query.search || '';
  const sortField = req.query.sortField || 'createdAt';
  const sortOrder = (req.query.sortOrder === 'ascend' || req.query.sortOrder === 'asc') ? 1 : -1;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    res.status(400);
    throw new Error('Category ID không hợp lệ');
  }

  const pipeline = [
    {
      $match: { category_id: new mongoose.Types.ObjectId(categoryId) }
    }
  ];

  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { product_name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      }
    });
  }

  pipeline.push(
    {
      $lookup: {
        from: 'inventories',
        localField: '_id',
        foreignField: 'product_id',
        as: 'inventory_data'
      }
    },
    {
      $addFields: {
        inventory_quantity: {
          $ifNull: [{ $arrayElemAt: ["$inventory_data.quantity_available", 0] }, 0]
        },
        cleanPrice: {
          $cond: {
            if: { $eq: [{ $type: "$price" }, "object"] },
            then: { $toDouble: { $getField: { field: { $literal: "$numberDecimal" }, input: "$price" } } },
            else: { $toDouble: "$price" }
          }
        }
      }
    },
    {
      $project: {
        inventory_data: 0,
        cleanPrice: 0
      }
    }
  );

  const sortObj = {};
  sortObj[sortField === 'price' ? 'cleanPrice' : sortField] = sortOrder;
  pipeline.push({ $sort: sortObj });

  pipeline.push({
    $facet: {
      metadata: [{ $count: "total" }],
      data: [{ $skip: (page - 1) * limit }, { $limit: limit }]
    }
  });

  const result = await Product.aggregate(pipeline);
  const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;
  const products = result[0].data;

  res.json({
    products,
    pagination: {
      current: page,
      pageSize: limit,
      total
    }
  });
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
  } = req.body

  if (!category_id || !product_name || !price || !type) {
    res.status(400)
    throw new Error('Thiếu thông tin bắt buộc của sản phẩm')
  }

  // Xử lý hình ảnh từ Cloudinary (chỉ 1 file)
  let images = []
  if (req.file) {
    // lưu url string vì model định nghĩa mảng string
    images = [req.file.path]
  }

  const product = new Product({
    category_id,
    product_name,
    description,
    price,
    stock_quantity: stock_quantity || 0,
    type,
    images,
  })

  const createdProduct = await product.save()
  res.status(201).json(createdProduct)
})

// @desc    Cập nhật sản phẩm
// @route   PUT /api/admin/products/:id
// @access  Private (Manager)
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { product_name, description, price, stock_quantity, type } = req.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Product ID không hợp lệ')
  }

  const product = await Product.findById(id)
  if (!product) {
    res.status(404)
    throw new Error('Sản phẩm không tồn tại')
  }

  // Xử lý hình ảnh mới từ Cloudinary (một file)
  let newImages = []
  if (req.file) {
    newImages = [req.file.path]
  }

  // Cập nhật thông tin sản phẩm
  product.product_name = product_name || product.product_name
  product.description = description || product.description
  product.price = price || product.price
  product.stock_quantity = stock_quantity !== undefined ? stock_quantity : product.stock_quantity
  product.type = type || product.type

  // Nếu có hình mới, chỉ giữ file mới (1 ảnh)
  if (newImages.length > 0) {
    product.images = newImages
  }

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