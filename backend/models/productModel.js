// models/productModel.js
import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    product_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    stock_quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    type: {
      type: String,
      required: true,
    },

    images: [
      {
        image_url: { type: String, required: true },
        is_primary: { type: Boolean, default: false }, // Ảnh chính
      },
    ],
  },
  {
    timestamps: true,
  }
)


productSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.price && ret.price.$numberDecimal) {
      ret.price = parseFloat(ret.price.$numberDecimal)
    }
    return ret
  },
})

const Product = mongoose.model('Product', productSchema)

export default Product
