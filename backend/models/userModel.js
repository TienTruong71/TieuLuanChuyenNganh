import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    full_name: { type: String, required: true },
    address: { type: String },
    googleId: {
        type: String,
      },
      authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
      },
      avatar: {
        type: String,
      },
      
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'inactive', 
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailOTP: {
      type: String,
    },
    emailOTPExpire: {
      type: Date,
    },
  },
  { timestamps: true }
  
)

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})


const User = mongoose.model('User', userSchema)
export default User
