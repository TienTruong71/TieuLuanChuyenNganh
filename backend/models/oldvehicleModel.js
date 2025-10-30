import mongoose from 'mongoose'

const oldVehicleSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    vehicle_info: {
      type: String,
      required: true,
    },
    price_offered: {
      type: mongoose.Types.Decimal128,
    },
    status: {
      type: String,
      enum: ['pending', 'evaluated', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
)

const OldVehicle = mongoose.model('OldVehicle', oldVehicleSchema)

export default OldVehicle