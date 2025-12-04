// backend/routes/admin/index.route.js
import express from 'express'
import categoryRoutes from './category.route.js'
import productRoutes from './product.route.js'
import customerRoutes from './customer.route.js'
import orderRoutes from './order.route.js'
import dashboardRoutes from './dashboard.route.js'
import staffRoutes from './staff.route.js'
import servicePackageRoutes from './servicePackage.route.js'
import promotionRoutes from './promotion.route.js'
import tradeinVehicleRoutes from './tradeinVehicle.route.js'
import revenueReportRoutes from './revenuereport.route.js'

const router = express.Router()

// Mount all admin routes
router.use('/categories', categoryRoutes)
router.use('/products', productRoutes)
router.use('/customers', customerRoutes)
router.use('/orders', orderRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/staff', staffRoutes)
router.use('/service-packages', servicePackageRoutes)
router.use('/promotions', promotionRoutes)
router.use('/tradein-vehicles', tradeinVehicleRoutes)
router.use('/revenue-reports', revenueReportRoutes)

export default router