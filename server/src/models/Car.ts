import mongoose, { Document, Schema } from 'mongoose'

export interface ICar extends Document {
    make: string
    carModel: string
    year: number
    color: string
    status: 'available' | 'rented' | 'maintenance'
    dailyRate: number
    mileage: number
    licensePlate: string
    createdAt: Date
    updatedAt: Date
}

const carSchema = new Schema<ICar>(
    {
        make: {
            type: String,
            required: [true, 'Car make is required'],
            trim: true,
        },
        carModel: {
            type: String,
            required: [true, 'Car model is required'],
            trim: true,
        },
        year: {
            type: Number,
            required: [true, 'Year is required'],
            min: [1900, 'Year must be after 1900'],
            max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
        },
        color: {
            type: String,
            required: [true, 'Color is required'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['available', 'rented', 'maintenance'],
            default: 'available',
        },
        dailyRate: {
            type: Number,
            required: [true, 'Daily rate is required'],
            min: [0, 'Daily rate must be positive'],
        },
        mileage: {
            type: Number,
            required: [true, 'Mileage is required'],
            min: [0, 'Mileage must be positive'],
        },
        licensePlate: {
            type: String,
            required: [true, 'License plate is required'],
            unique: true,
            trim: true,
            uppercase: true,
        },
    },
    {
        timestamps: true,
    }
)

// Index for efficient queries
carSchema.index({ status: 1 })
carSchema.index({ make: 1, carModel: 1 })

export const Car = mongoose.model<ICar>('Car', carSchema)
