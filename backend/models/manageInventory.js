import mongoose from 'mongoose'

const warehouseTransactionSchema = mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    type: {
      type: String,
      enum: ['import', 'export', 'return', 'adjustment'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    transaction_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

const WarehouseTransaction = mongoose.model('WarehouseTransaction', warehouseTransactionSchema)

export default WarehouseTransaction