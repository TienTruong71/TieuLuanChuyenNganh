import asyncHandler from 'express-async-handler'
import Product from '../../models/productModel.js'
import mongoose from 'mongoose'


export const getProducts = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice } = req.query;
  const page = parseInt(req.query.current || req.query.page) || 1;
  const limit = parseInt(req.query.pageSize || req.query.limit) || 10;
  const search = req.query.search || '';
  const sortField = req.query.sortField || 'createdAt';
  const sortOrder = (req.query.sortOrder === 'ascend' || req.query.sortOrder === 'asc') ? 1 : -1;

  let matchQuery = {};
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    matchQuery.category_id = new mongoose.Types.ObjectId(category);
  }

  if (search) {
    matchQuery.$or = [
      { product_name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const pipeline = [
    { $match: matchQuery },
    {
      $addFields: {
        cleanPrice: {
          $cond: {
            if: { $eq: [{ $type: "$price" }, "object"] },
            then: { $toDouble: { $getField: { field: { $literal: "$numberDecimal" }, input: "$price" } } },
            else: { $toDouble: "$price" }
          }
        }
      }
    }
  ];

  if (minPrice || maxPrice) {
    let priceFilter = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    pipeline.push({ $match: { cleanPrice: priceFilter } });
  }

  const sortObj = {};
  sortObj[sortField === 'price' ? 'cleanPrice' : sortField] = sortOrder;
  
  pipeline.push({ $sort: sortObj });

  pipeline.push({
    $facet: {
      metadata: [{ $count: "total" }],
      data: [
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: "categories",
            localField: "category_id",
            foreignField: "_id",
            as: "category_info"
          }
        },
        {
          $unwind: {
            path: "$category_info",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            category_id: "$category_info"
          }
        },
        { $project: { category_info: 0, cleanPrice: 0 } }
      ]
    }
  });

  const [result] = await Product.aggregate(pipeline);
  
  const total = result.metadata.length > 0 ? result.metadata[0].total : 0;
  const products = result.data;

  res.json({
    products,
    pagination: {
      current: page,
      pageSize: limit,
      total
    }
  });
})


export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params

  console.log('Getting product by ID:', id)

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error('Invalid product ID:', id)
    res.status(400)
    throw new Error('Product ID không hợp lệ')
  }

  const product = await Product.findById(id)
    .populate('category_id', 'category_name image')

  if (!product) {
    console.error('Product not found:', id)
    res.status(404)
    throw new Error('Không tìm thấy sản phẩm')
  }

  console.log('Product found:', {
    id: product._id,
    name: product.product_name,
    images: product.images,
    hasImages: !!product.images,
    imagesLength: product.images?.length,
  })

  res.json(product)
})


export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate('category_id', 'category_name')
  res.json(products)
})


export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    res.status(400)
    throw new Error('Category ID không hợp lệ')
  }

  const products = await Product.find({ category_id: categoryId })
  res.json(products)
})

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


  if (!product_name) {
    res.status(400)
    throw new Error('Tên sản phẩm là bắt buộc')
  }

  if (!price || price <= 0) {
    res.status(400)
    throw new Error('Giá sản phẩm phải lớn hơn 0')
  }


  if (category_id && !mongoose.Types.ObjectId.isValid(category_id)) {
    res.status(400)
    throw new Error('Category ID không hợp lệ')
  }

  const product = new Product({
    category_id: category_id || null, 
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