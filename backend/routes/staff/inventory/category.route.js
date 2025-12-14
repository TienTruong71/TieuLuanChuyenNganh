import express from 'express';
import { getCategories } from '../../../controllers/client/category.controller.js';
import { protect, inventoryStaff } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(inventoryStaff);

router.get('/', getCategories);

export default router;