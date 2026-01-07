import mongoose, { Document, Schema } from 'mongoose'

export interface IRentalRequest extends Document {
    customerName: string
    customerEmail: string
    customerPhone: string
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
        customerName: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
        },
        customerEmail: {
            type: String,
            required: [true, 'Customer email is required'],
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        customerPhone: {
            type: String,
            required: [true, 'Customer phone is required'],
            trim: true,
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
rentalRequestSchema.index({ status: 1 })
rentalRequestSchema.index({ startDate: 1, endDate: 1 })

export const RentalRequest = mongoose.model<IRentalRequest>('RentalRequest', rentalRequestSchema)
