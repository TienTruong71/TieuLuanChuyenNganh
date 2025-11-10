import express from 'express'
import { getProducts, getProductById } from '../../controllers/client/product.controller.js'
import Product from '../../models/productModel.js'

const router = express.Router()

// Route: Lấy danh sách sản phẩm, có thể lọc theo category hoặc price
router.get('/', async (req, res) => { 
  try {
    const products = await Product.find().populate('category_id', 'category_name')
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Route: Xem chi tiết sản phẩm theo id
router.get('/:id', getProductById)

export default router
