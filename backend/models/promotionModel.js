import mongoose from 'mongoose'

const promotionSchema = mongoose.Schema(
  {
    promotion_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    discount_percent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Promotion = mongoose.model('Promotion', promotionSchema)

export default Promotion