import express from 'express'
import {
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../controllers/admin/product.controller.js'
import { protect, admin } from '../../middleware/authMiddleware.js'

const router = express.Router()

// Chỉ manager/admin mới được thao tác
router.use(protect)
router.use(admin)

// Lấy danh sách sản phẩm theo category
router.get('/:categoryId', getProductsByCategory)

// Thêm sản phẩm mới
router.post('/', createProduct)

// Cập nhật sản phẩm
router.put('/:id', updateProduct)

// Xóa sản phẩm
router.delete('/:id', deleteProduct)

export default router
