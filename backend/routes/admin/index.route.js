import express from 'express'
import categoryRoutes from './category.route.js'
import productRoutes from './product.route.js'
import customerRoutes from './customer.route.js'

const router = express.Router()

router.use('/categories', categoryRoutes)
router.use('/products', productRoutes)
router.use('/customers', customerRoutes)

export default router
