import mongoose from 'mongoose'

const servicePackageSchema = mongoose.Schema(
  {
    service_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const ServicePackage = mongoose.model('ServicePackage', servicePackageSchema)

export default ServicePackage