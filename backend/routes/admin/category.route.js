import express from 'express'
import { getCategories, createCategory } from '../../controllers/admin/category.controller.js'

const router = express.Router()

router.route('/')
  .get(getCategories)      // GET /api/admin/categories
  .post(createCategory)    // POST /api/admin/categories

export default router
