import express from 'express'
import { 
  getCategories, 
  createCategory,
  updateCategory,
  deleteCategory 
} from '../../controllers/admin/category.controller.js'
import { protect, admin } from '../../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)
router.use(admin)

router.route('/')
  .get(getCategories)
  .post(createCategory)

router.route('/:id')
  .put(updateCategory)
  .delete(deleteCategory)

export default router