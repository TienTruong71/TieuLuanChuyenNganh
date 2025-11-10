import express from 'express'
import { getProducts, getProductById } from '../../controllers/client/product.controller.js'

const router = express.Router()

// Route: Lấy danh sách sản phẩm, có thể lọc theo category hoặc price
router.get('/', getProducts)

// Route: Xem chi tiết sản phẩm theo id
router.get('/:id', getProductById)

export default router
