import mongoose from 'mongoose'

const productImageSchema = mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    image_url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const ProductImage = mongoose.model('ProductImage', productImageSchema)

export default ProductImage