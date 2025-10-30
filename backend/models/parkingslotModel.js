import mongoose from 'mongoose'

const parkingSlotSchema = mongoose.Schema(
  {
    slot_number: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
)

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema)

export default ParkingSlot