// backend/models/serviceBayModel.js
import mongoose from 'mongoose'

const serviceBaySchema = mongoose.Schema(
    {
        bay_number: {
            type: String,
            required: true,
            unique: true, // Số hiệu khu vực dịch vụ (ví dụ: Bay 1, Bay 2)
        },
        status: {
            type: String,
            enum: ['available', 'occupied', 'maintenance'],
            default: 'available',
        },
        current_booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            default: null, // Lịch hẹn hiện tại (nếu đang occupied)
        },
        last_maintenance: {
            type: Date, // Lần bảo trì gần nhất
        },
        notes: {
            type: String,
            default: '', // Ghi chú về khu vực (ví dụ: "Cần thay thiết bị")
        },
    },
    {
        timestamps: true,
    }
)

const ServiceBay = mongoose.model('ServiceBay', serviceBaySchema)

export default ServiceBay