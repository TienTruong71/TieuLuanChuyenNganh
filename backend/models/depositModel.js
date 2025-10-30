import mongoose from 'mongoose'

const depositSchema = mongoose.Schema(
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
    amount: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    deposit_date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'refunded', 'completed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
)

const Deposit = mongoose.model('Deposit', depositSchema)

export default Deposit