import express from 'express'
import categoryRoutes from './category.route.js'
import productRoutes from './product.route.js'

const router = express.Router()

router.use('/categories', categoryRoutes)
router.use('/products', productRoutes)

export default router
