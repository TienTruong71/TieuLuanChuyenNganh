import express from 'express'
import { getProducts, getProductById } from '../../controllers/client/product.controller.js'

const router = express.Router()

// GET /api/client/products
router.get('/', getProducts)

// GET /api/client/products/:id
router.get('/:id', getProductById)

export default router