// backend/models/repairProgressModel.js
import mongoose from 'mongoose'

const repairProgressSchema = mongoose.Schema(
    {
        booking_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
        },
        staff_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['in_progress', 'waiting_parts', 'testing', 'completed'],
            default: 'in_progress',
        },
        notes: {
            type: String,
            default: '',
        },
        estimated_completion: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
)

const RepairProgress = mongoose.model('RepairProgress', repairProgressSchema)

export default RepairProgress