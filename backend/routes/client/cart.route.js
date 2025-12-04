import express from 'express'
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from '../../controllers/client/cart.controller.js'
import { protect } from '../../middleware/authMiddleware.js'

const router = express.Router()

// ✅ Chỉ dùng protect, BỎ customer
router.route('/')
    .get(protect, getCart)
    .post(protect, addToCart)
    .put(protect, updateCartItem)
    .delete(protect, clearCart)

router.route('/:product_id')
    .delete(protect, removeFromCart)

export default router