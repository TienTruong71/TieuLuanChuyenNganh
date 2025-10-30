import mongoose from 'mongoose'

const inventorySchema = mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true,
    },
    quantity_available: {
      type: Number,
      required: true,
      default: 0,
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

const Inventory = mongoose.model('Inventory', inventorySchema)

export default Inventory