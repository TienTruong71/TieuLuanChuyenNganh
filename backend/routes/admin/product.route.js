import express from 'express'
import Product from '../models/productModel.js'

const router = express.Router()

// [GET] /api/products - Public API cho frontend
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('category_id', 'category_name')
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
