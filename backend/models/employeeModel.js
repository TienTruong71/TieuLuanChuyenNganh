import mongoose from 'mongoose'

const employeeSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    salary: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    hired_date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Employee = mongoose.model('Employee', employeeSchema)

export default Employee