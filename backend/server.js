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
import productRoutes from './routes/admin/product.route.js'
import clientAuthRoutes from './routes/client/auth.route.js'
import customerRoutes from './routes/admin/customer.route.js'
// === MOUNT ROUTES ===
app.use('/api/admin/categories', categoryRoutes)
app.use('/api/admin/products', productRoutes)
app.use('/api/admin/customers', customerRoutes)
app.use('/api/client/auth', clientAuthRoutes)

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