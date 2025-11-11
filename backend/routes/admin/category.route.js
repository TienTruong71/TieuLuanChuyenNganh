// backend/routes/admin/category.routes.js (Cập nhật để có đầy đủ CRUD)
import express from 'express'
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../../controllers/admin/category.controller.js'
import { protect, admin } from '../../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, admin)

router.route('/')
  .get(getCategories)      // GET /api/admin/categories
  .post(createCategory)    // POST /api/admin/categories

router.route('/:id')
  .get(getCategoryById)    // GET /api/admin/categories/:id
  .put(updateCategory)     // PUT /api/admin/categories/:id
  .delete(deleteCategory)  // DELETE /api/admin/categories/:id

export default router