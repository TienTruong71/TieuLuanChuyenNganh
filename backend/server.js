import path from 'path'
import fs from 'fs'
import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import colors from 'colors'

import connectDB from './config/db.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

dotenv.config({ path: './backend/.env' })

// Kết nối Database
connectDB()

const app = express()
const __dirname = path.resolve()

// Middleware cơ bản
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use(express.json())

// Hàm tự động load route
const loadRoutes = async (baseDir, basePath) => {
  const files = fs.readdirSync(baseDir)
  for (const file of files) {
    const fullPath = path.join(baseDir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      await loadRoutes(fullPath, `${basePath}/${file}`)
        } 
      else if (file.endsWith('.js')) {
      const routeModule = await import(`file://${fullPath}`)
      const route = routeModule.default || routeModule
      if (route && typeof route === 'function') {
        app.use(basePath, route)
        console.log(` Loaded route: ${basePath}/${file}`)
      } else {
        console.warn(`Skipped route: ${file} (no valid router exported)`)
      }
    }
  }
}


//  Gắn route theo vai trò
await loadRoutes(path.join(__dirname, '/backend/routes/client'), '/api/client')
await loadRoutes(path.join(__dirname, '/backend/routes/admin'), '/api/admin')
await loadRoutes(path.join(__dirname, '/backend/routes/staff'), '/api/staff')
await loadRoutes(path.join(__dirname, '/backend/routes/common'), '/api/common')

// Static upload (ảnh, file)
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

// Cấu hình thanh toán (PayPal)
app.get('/api/config/paypal', (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID)
)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')))
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  )
} else {
  app.get('/', (req, res) => res.send(' API Server is running...'))
}

// Middleware xử lý lỗi
app.use(notFound)
app.use(errorHandler)

// Khởi chạy server
const PORT = process.env.PORT || 5000
app.listen(
  PORT,
  () => console.log(`Server running on port ${PORT}`.yellow.bold)
)
