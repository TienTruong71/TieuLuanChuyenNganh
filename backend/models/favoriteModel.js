import mongoose from 'mongoose'

const favoriteSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index to ensure a user can only favorite a product once
favoriteSchema.index({ user_id: 1, product_id: 1 }, { unique: true })

const Favorite = mongoose.model('Favorite', favoriteSchema)

export default Favorite