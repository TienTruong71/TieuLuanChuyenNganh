import express from 'express'
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from '../../controllers/client/cart.controller.js'
import { protect, customer } from '../../middleware/authMiddleware.js'

const router = express.Router()

// Bảo vệ tất cả route bằng customer
router.use(protect, customer)

router.route('/')
    .get(getCart)         // GET /api/client/cart
    .post(addToCart)      // POST /api/client/cart
    .put(updateCartItem)  // PUT /api/client/cart
    .delete(clearCart)    // DELETE /api/client/cart

router.route('/:product_id')
    .delete(removeFromCart) // DELETE /api/client/cart/:product_id

export default router