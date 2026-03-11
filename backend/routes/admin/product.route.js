import express from 'express'
import {
  getProductsByCategory,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../controllers/admin/product.controller.js'
import { protect, admin } from '../../middleware/authMiddleware.js'
import { upload } from '../../config/cloudinary.js'

const router = express.Router()

// Chỉ manager/admin mới được thao tác
router.use(protect)
router.use(admin)

// Middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error('Multer Error:', err)
    return res.status(400).json({ message: err.message })
  }
  next()
}

router.get('/', getAllProducts)

// Lấy danh sách sản phẩm theo category
router.get('/:categoryId', getProductsByCategory)

// Thêm sản phẩm mới
router.post('/', (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    handleMulterError(err, req, res, () => createProduct(req, res))
  })
})

// Cập nhật sản phẩm
router.put('/:id', (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    handleMulterError(err, req, res, () => updateProduct(req, res))
  })
})

// Xóa sản phẩm
router.delete('/:id', deleteProduct)

export default router
