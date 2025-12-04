import mongoose from 'mongoose'

const productSchema = mongoose.Schema(
  {
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false, 
    },
    product_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    stock_quantity: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['product', 'service'],
      default: 'product',
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

const Product = mongoose.model('Product', productSchema)

export default Product