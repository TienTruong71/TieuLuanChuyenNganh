import mongoose from 'mongoose'

const oldVehicleBillSchema = mongoose.Schema(
  {
    old_vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OldVehicle',
      required: true,
    },
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    amount: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const OldVehicleBill = mongoose.model('OldVehicleBill', oldVehicleBillSchema)

export default OldVehicleBill