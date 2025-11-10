import asyncHandler from 'express-async-handler'
import Promotion from '../../models/promotionModel.js'
import ProductPromotion from '../../models/productPromotionModel.js'
// [GET] /api/promotions
// Lấy danh sách tất cả khuyến mãi
const getPromotions = asyncHandler(async (req, res) => {
  const promotions = await Promotion.find().sort({ createdAt: -1 })
  res.json(promotions)
})

// [GET] /api/promotions/:id
// Lấy thông tin chi tiết 1 khuyến mãi
const getPromotionById = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id)
  if (!promotion) {
    res.status(404)
    throw new Error('Không tìm thấy khuyến mãi')
  }
  res.json(promotion)
})

// [POST] /api/promotions
// Tạo mới khuyến mãi
const createPromotion = asyncHandler(async (req, res) => {
  const { promotion_name, description, discount_percent, start_date, end_date } = req.body

  // Kiểm tra trùng tên khuyến mãi
  const existing = await Promotion.findOne({ promotion_name })
  if (existing) {
    res.status(400)
    throw new Error('Mã hoặc tên khuyến mãi đã tồn tại')
  }

  const promotion = await Promotion.create({
    promotion_name,
    description,
    discount_percent,
    start_date,
    end_date,
  })

  res.status(201).json({
    message: 'Tạo khuyến mãi thành công',
    promotion,
  })
})

// [PUT] /api/promotions/:id
// Cập nhật thông tin khuyến mãi
const updatePromotion = asyncHandler(async (req, res) => {
  const { promotion_name, description, discount_percent, start_date, end_date } = req.body

  const promotion = await Promotion.findById(req.params.id)
  if (!promotion) {
    res.status(404)
    throw new Error('Không tìm thấy khuyến mãi để cập nhật')
  }

  // Kiểm tra trùng tên khuyến mãi khác
  const existing = await Promotion.findOne({
    promotion_name,
    _id: { $ne: req.params.id },
  })
  if (existing) {
    res.status(400)
    throw new Error('Tên khuyến mãi đã tồn tại')
  }

  promotion.promotion_name = promotion_name || promotion.promotion_name
  promotion.description = description || promotion.description
  promotion.discount_percent = discount_percent ?? promotion.discount_percent
  promotion.start_date = start_date || promotion.start_date
  promotion.end_date = end_date || promotion.end_date

  const updatedPromotion = await promotion.save()
  res.json({
    message: 'Cập nhật khuyến mãi thành công',
    promotion: updatedPromotion,
  })
})

// [DELETE] /api/promotions/:id
// Xóa khuyến mãi
const deletePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id)
  if (!promotion) {
    res.status(404)
    throw new Error('Không tìm thấy khuyến mãi để xóa')
  }

  await promotion.deleteOne()
  res.json({ message: 'Xóa khuyến mãi thành công' })
})






// [POST] /api/promotions/:promotionId/products
// Gán sản phẩm vào khuyến mãi
const addProductToPromotion = asyncHandler(async (req, res) => {
  const { product_id } = req.body
  const { promotionId } = req.params

  const existing = await ProductPromotion.findOne({ product_id, promotion_id: promotionId })
  if (existing) {
    res.status(400)
    throw new Error('Sản phẩm đã có trong khuyến mãi này')
  }

  const productPromotion = await ProductPromotion.create({
    product_id,
    promotion_id: promotionId,
  })

  res.status(201).json({
    message: 'Thêm sản phẩm vào khuyến mãi thành công',
    productPromotion,
  })
})

// [DELETE] /api/promotions/:promotionId/products/:productId
// Gỡ sản phẩm ra khỏi khuyến mãi
const removeProductFromPromotion = asyncHandler(async (req, res) => {
  const { promotionId, productId } = req.params
  const productPromotion = await ProductPromotion.findOne({ promotion_id: promotionId, product_id: productId })

  if (!productPromotion) {
    res.status(404)
    throw new Error('Không tìm thấy sản phẩm trong khuyến mãi')
  }

  await productPromotion.deleteOne()
  res.json({ message: 'Đã gỡ sản phẩm khỏi khuyến mãi' })
})

export {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  removeProductFromPromotion,
  addProductToPromotion,
}