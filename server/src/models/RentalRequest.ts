import mongoose, { Document, Schema } from 'mongoose'

export interface IRentalRequest extends Document {
    userId: mongoose.Types.ObjectId
    carId: mongoose.Types.ObjectId
    startDate: Date
    endDate: Date
    status: 'pending' | 'approved' | 'completed' | 'rejected' | 'cancelled'
    notes?: string
    totalCost: number
    createdAt: Date
    updatedAt: Date
}

const rentalRequestSchema = new Schema<IRentalRequest>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        carId: {
            type: Schema.Types.ObjectId,
            ref: 'Car',
            required: [true, 'Car ID is required'],
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'completed', 'rejected', 'cancelled'],
            default: 'pending',
        },
        notes: {
            type: String,
            trim: true,
        },
        totalCost: {
            type: Number,
            required: [true, 'Total cost is required'],
            min: [0, 'Total cost must be positive'],
        },
    },
    {
        timestamps: true,
    }
)

// Indexes for efficient queries
rentalRequestSchema.index({ carId: 1 })
rentalRequestSchema.index({ userId: 1 })
rentalRequestSchema.index({ status: 1 })
rentalRequestSchema.index({ startDate: 1, endDate: 1 })

export const RentalRequest = mongoose.model<IRentalRequest>('RentalRequest', rentalRequestSchema)
