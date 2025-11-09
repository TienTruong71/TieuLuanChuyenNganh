// backend/models/cartModel.js
import mongoose from 'mongoose'

const cartItemSchema = mongoose.Schema(
    {
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { _id: false }
)

const cartSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        items: [cartItemSchema],
    },
    {
        timestamps: true,
    }
)

// Đảm bảo mỗi user chỉ có 1 giỏ hàng
cartSchema.index({ user_id: 1 }, { unique: true })

const Cart = mongoose.model('Cart', cartSchema)

export default Cart