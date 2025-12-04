// routes/client/category.routes.js
import express from 'express'
import { getCategories } from '../../controllers/client/category.controller.js'

const router = express.Router()

router.get('/', getCategories)

export default router