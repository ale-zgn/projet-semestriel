import mongoose, { Document, Schema } from 'mongoose'

export interface INotification extends Document {
    title: string
    location: string // Model name e.g., 'RentalRequest'
    locationId: mongoose.Types.ObjectId
    isOpened: boolean
    userId: mongoose.Types.ObjectId // Created for this user
    createdAt: Date
    updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Location model name is required'],
        },
        locationId: {
            type: Schema.Types.ObjectId,
            required: [true, 'Location ID is required'],
        },
        isOpened: {
            type: Boolean,
            default: false,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
    },
    {
        timestamps: true,
    }
)

// Indexes for performance
notificationSchema.index({ userId: 1, isOpened: 1 })
notificationSchema.index({ createdAt: -1 })

export const Notification = mongoose.model<INotification>('Notification', notificationSchema)
