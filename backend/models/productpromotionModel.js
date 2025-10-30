import mongoose from 'mongoose'

const productPromotionSchema = mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    promotion_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promotion',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index to ensure a product can only have one active promotion
productPromotionSchema.index({ product_id: 1, promotion_id: 1 }, { unique: true })

const ProductPromotion = mongoose.model('ProductPromotion', productPromotionSchema)

export default ProductPromotion