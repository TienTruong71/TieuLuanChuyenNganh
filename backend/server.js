// backend/server.js
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import colors from 'colors'
import cors from "cors"

// Config & Middleware
import connectDB from './config/db.js'
import './models/index.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

// === IMPORT ROUTES (Admin) ===
import categoryRoutes from './routes/admin/category.route.js'
import productAdminRoutes from './routes/admin/product.route.js'
import customerRoutes from './routes/admin/customer.route.js'
import staffRoutes from './routes/admin/staff.route.js'
import servicePackageRoutes from './routes/admin/servicePackage.route.js'
import tradeinVehicleRoutes from './routes/admin/tradeinVehicle.route.js'
import revenueReportRoutes from './routes/admin/revenuereport.route.js'
import promotionRoutes from './routes/admin/promotion.route.js'
import adminOrderRoutes from './routes/admin/order.route.js'
import dashboardRoutes from './routes/admin/dashboard.route.js'
import adminRoutes from './routes/admin/index.route.js'

// === IMPORT ROUTES (Client) ===
import clientAuthRoutes from './routes/client/auth.route.js'
import clientProductRoutes from './routes/client/product.route.js'
import bookingRoutes from './routes/client/booking.route.js'
import cartRoutes from './routes/client/cart.route.js'
import clientFeedbackRoutes from './routes/client/feedback.route.js'
import clientOrderRoutes from './routes/client/order.route.js'
import clientSupportRoutes from './routes/client/support.route.js'
import notificationRoutes from './routes/client/notification.route.js'
import paymentRoutes from './routes/client/payment.route.js'
import profileRoutes from './routes/client/profile.route.js'
import serviceRoutes from './routes/client/service.route.js'
import clientCategoryRoutes from './routes/client/category.routes.js'

// === IMPORT ROUTES (Staff) ===
import contractRoutes from './routes/staff/sale/contract.route.js'
import staffFeedbackRoutes from './routes/staff/sale/feedback.route.js' // Đổi tên để tránh trùng client
import staffSupportRoutes from './routes/staff/sale/support.route.js'   // Đổi tên để tránh trùng client
import inventoryRoutes from './routes/staff/inventory/inventory.route.js'
import stockRoutes from './routes/staff/inventory/stock.route.js'
import appointmentRoutes from './routes/staff/service/appointment.route.js'
import repairProgressRoutes from './routes/staff/service/repair.route.js'
import serviceBayRoutes from './routes/staff/service/serviceBay.route.js'
import categoryStaffRoutes from './routes/staff/inventory/category.route.js';

// === IMPORT ROUTES (Other) ===
import AIroutes from './routes/AI/AI.route.js'

// Config Environment
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })

// Connect DB
connectDB()

const app = express()

// Cấu hình Cache & CORS
app.set('etag', false);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(cors());

// Middleware JSON & Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use(express.json())

// Uploads Static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ===========================
//      MOUNT ROUTES
// ===========================

// --- ADMIN ---
app.use('/api/admin/categories', categoryRoutes)
app.use('/api/admin/products', productAdminRoutes)
app.use('/api/admin/customers', customerRoutes)
app.use('/api/admin/staff', staffRoutes)
app.use('/api/admin/service-packages', servicePackageRoutes)
app.use('/api/admin/tradeinVehicles', tradeinVehicleRoutes)
app.use('/api/admin/revenue-reports', revenueReportRoutes)
app.use('/api/admin/promotions', promotionRoutes)
app.use('/api/admin/orders', adminOrderRoutes)
app.use('/api/admin/dashboard', dashboardRoutes)
app.use('/api/admin', adminRoutes)

// --- CLIENT ---
app.use('/api/client/auth', clientAuthRoutes)
app.use('/api/client/bookings', bookingRoutes)
app.use('/api/client/products', clientProductRoutes)
app.use('/api/client/cart', cartRoutes)
app.use('/api/client/feedbacks', clientFeedbackRoutes)
app.use('/api/client/orders', clientOrderRoutes)
app.use('/api/client/support', clientSupportRoutes)
app.use('/api/client/notifications', notificationRoutes)
app.use('/api/client/payments', paymentRoutes)
app.use('/api/client/profile', profileRoutes)
app.use('/api/client/services', serviceRoutes)
app.use('/api/client/categories', clientCategoryRoutes)

// --- STAFF (SALE) ---
app.use('/api/staff/sale/contracts', contractRoutes)
app.use('/api/staff/sale/feedbacks', staffFeedbackRoutes)
app.use('/api/staff/sale/support', staffSupportRoutes)

// --- STAFF (INVENTORY) ---
app.use('/api/staff/inventory', inventoryRoutes)
app.use('/api/staff/stock', stockRoutes)
app.use('/api/staff/categories', categoryStaffRoutes);

// --- STAFF (SERVICE) ---
app.use('/api/staff/service/appointments', appointmentRoutes)
app.use('/api/staff/service/repair-progress', repairProgressRoutes)
app.use('/api/staff/service/service-bays', serviceBayRoutes)

// --- AI ---
app.use('/api/ai', AIroutes)

// ===========================

// PayPal Config
app.get('/api/config/paypal', (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID || '')
)

// Production Build
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