import mongoose from 'mongoose'

const employeeRevenueSchema = mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    revenue: {
      type: mongoose.Types.Decimal128,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

const EmployeeRevenue = mongoose.model('EmployeeRevenue', employeeRevenueSchema)

export default EmployeeRevenue