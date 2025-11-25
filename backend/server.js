// backend/server.js
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import colors from 'colors'
import connectDB from './config/db.js'
import './models/index.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

// Fix __dirname cho ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

// Connect DB
connectDB()

const app = express()

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use(express.json())

// === IMPORT ROUTES ===
import categoryRoutes from './routes/admin/category.route.js'
import productAdminRoutes from './routes/admin/product.route.js'
import clientAuthRoutes from './routes/client/auth.route.js'
import customerRoutes from './routes/admin/customer.route.js'
import staffRoutes from './routes/admin/staff.route.js'
import servicePackageRoutes from './routes/admin/servicePackage.route.js'
import tradeinVehicleRoutes from './routes/admin/tradeinVehicle.route.js'
import bookingRoutes from './routes/client/booking.route.js'
import cartRoutes from './routes/client/cart.route.js'
import feedbackRoutes from './routes/client/feedback.route.js'
import orderRoutes from './routes/client/order.route.js'
import supportRoutes from './routes/client/support.route.js'
import notificationRoutes from './routes/client/notification.route.js'
import paymentRoutes from './routes/client/payment.route.js'
import productRoutes from './routes/client/product.route.js'
import profileRoutes from './routes/client/profile.route.js'
import revenueReportRoutes from './routes/admin/revenuereport.route.js'
import promotionRoutes from './routes/admin/promotion.route.js'
import adminOrderRoutes from './routes/admin/order.route.js'
import dashboardRoutes from './routes/admin/dashboard.route.js'
import contractRoutes from './routes/staff/sale/contract.route.js'
import appointmentRoutes from './routes/staff/service/appointment.route.js'
import repairProgressRoutes from './routes/staff/service/repair.route.js'
import serviceBayRoutes from './routes/staff/service/serviceBay.route.js'

// === MOUNT ROUTES ===
app.use('/api/admin/categories', categoryRoutes)
app.use('/api/admin/products', productAdminRoutes)
app.use('/api/admin/customers', customerRoutes)
app.use('/api/client/auth', clientAuthRoutes)
app.use('/api/admin/staff', staffRoutes)
app.use('/api/admin/service-packages', servicePackageRoutes)
app.use('/api/admin/tradein-vehicles', tradeinVehicleRoutes)
app.use('/api/client/bookings', bookingRoutes)
app.use('/api/client/cart', cartRoutes)
app.use('/api/client/feedbacks', feedbackRoutes)
app.use('/api/client/orders', orderRoutes)
app.use('/api/client/support', supportRoutes)
app.use('/api/client/notifications', notificationRoutes)
app.use('/api/client/payments', paymentRoutes)
app.use('/api/client/products', productRoutes)
app.use('/api/client/profile', profileRoutes)
app.use('/api/admin/revenue-reports', revenueReportRoutes)
app.use('/api/admin/promotions', promotionRoutes)
app.use('/api/admin/orders', adminOrderRoutes)
app.use('/api/admin/dashboard', dashboardRoutes)
app.use('/api/staff/sale/contracts', contractRoutes)
app.use('/api/staff/service/appointments', appointmentRoutes)
app.use('/api/staff/service/repair-progress', repairProgressRoutes)
app.use('/api/staff/service/service-bays', serviceBayRoutes)

// Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// PayPal
app.get('/api/config/paypal', (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID || '')
)

// Production
if (process.env.NODE_ENV === 'production') {
  const frontendBuild = path.join(__dirname, '../frontend/build')
  app.use(express.static(frontendBuild))
  app.get('*', (req, res) =>
    res.sendFile(path.join(frontendBuild, 'index.html'))
  )
} else {
  app.get('/', (req, res) => res.send('API is running...'))
}

// Error Handler
app.use(notFound)
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`.yellow.bold)
)