import mongoose from 'mongoose'

const bookingSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServicePackage',
      required: false,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false,
    },
    booking_type: {
      type: String,
      enum: ['service', 'vehicle'],
      required: true,
      default: 'service',
    },
    booking_date: {
      type: Date,
      required: true,
    },
    time_slot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    note: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
      default: 0
    },
  },
  {
    timestamps: true,
  }
)

bookingSchema.pre('save', async function () {
  if (!this.service_id && !this.product_id) {
    throw new Error('Booking phải có service_id hoặc product_id')
  }
})

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking