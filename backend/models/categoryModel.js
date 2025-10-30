import mongoose from 'mongoose'

const categorySchema = mongoose.Schema(
  {
    category_name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
     image: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
)

const Category = mongoose.model('Category', categorySchema)

export default Category