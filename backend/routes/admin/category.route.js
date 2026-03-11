// backend/routes/admin/category.routes.js (Cập nhật để có đầy đủ CRUD)
import express from 'express'
import { 
  getCategories, 
  createCategory,
  updateCategory,
  deleteCategory 
} from '../../controllers/admin/category.controller.js'
import { protect, admin } from '../../middleware/authMiddleware.js'
import { upload } from '../../config/cloudinary.js'

const router = express.Router()

router.use(protect)
router.use(admin)

// Middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error('Multer Error:', err)
    return res.status(400).json({ message: err.message })
  }
  next()
}

router.route('/')
  .get(getCategories)
  .post((req, res, next) => {
    upload.single('image')(req, res, (err) => {
      handleMulterError(err, req, res, () => createCategory(req, res))
    })
  })

router.route('/:id')
  .put((req, res, next) => {
    upload.single('image')(req, res, (err) => {
      handleMulterError(err, req, res, () => updateCategory(req, res))
    })
  })
  .delete(deleteCategory)

export default router