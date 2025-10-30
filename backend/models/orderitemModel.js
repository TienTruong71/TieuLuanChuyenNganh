import mongoose from 'mongoose'

const orderItemSchema = mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
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
    price: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const OrderItem = mongoose.model('OrderItem', orderItemSchema)

export default OrderItem