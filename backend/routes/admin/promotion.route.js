import express from 'express'
import {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  addProductToPromotion,
  removeProductFromPromotion,
} from '../../controllers/admin/promotion.controller.js'

import { protect, admin } from '../../middleware/authMiddleware.js'

const router = express.Router()

// Tất cả route đều yêu cầu đăng nhập và quyền admin (hoặc manager)
router.use(protect)
router.use(admin)

// --- CRUD Promotions ---
router.route('/')
  .get(getPromotions)
  .post(createPromotion)

router.route('/:id')
  .get(getPromotionById)
  .put(updatePromotion)
  .delete(deletePromotion)

// --- Quản lý sản phẩm trong khuyến mãi ---
router
  .route('/:promotionId/products')
  .post(addProductToPromotion) // Gán sản phẩm vào khuyến mãi

router
  .route('/:promotionId/products/:productId')
  .delete(removeProductFromPromotion)

export default router
