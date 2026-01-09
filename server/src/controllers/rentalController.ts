import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { RentalRequest } from '../models/RentalRequest'
import { Notification } from '../models/Notification'
import { User } from '../models/User'
import { emitToUser, emitToAll } from '../utils/socket'

export const getRentals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status } = req.query
        const user = req.user

        // Build filter object
        const filter: any = {}
        if (status) filter.status = status

        // If user is not admin, only show their rentals by userId
        if (user && user.role !== 'admin') {
            filter.userId = user.userId
        }

        const rentals = await RentalRequest.find(filter).populate('carId').populate('userId', 'username email phone').sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            message: 'Rental requests retrieved successfully',
            data: {
                rentals,
                count: rentals.length,
            },
        })
    } catch (error) {
        next(error)
    }
}

export const createRental = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Check validation errors
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            })
            return
        }

        // Validate dates
        const { startDate, endDate } = req.body
        if (new Date(endDate) <= new Date(startDate)) {
            res.status(400).json({
                success: false,
                message: 'End date must be after start date',
            })
            return
        }
        // Check for overlapping rentals
        const overlappingRental = await RentalRequest.findOne({
            carId: req.body.carId,
            status: 'approved',
            $or: [{ startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }],
        })

        if (overlappingRental) {
            res.status(400).json({
                success: false,
                message: 'Car is already rented for this period',
            })
            return
        }

        const rentalData = { ...req.body }
        if (req.user) {
            rentalData.userId = req.user.userId
        }

        const rental = await RentalRequest.create(rentalData)
        await rental.populate(['carId', 'userId'])

        // Notify admins
        try {
            const admins = await User.find({ role: 'admin' })
            const customerName = rental.userId && 'username' in rental.userId ? rental.userId.username : 'Unknown Customer'
            const notifications = admins.map((admin) => ({
                title: `New rental request from ${customerName}`,
                location: 'RentalRequest',
                locationId: rental._id,
                userId: admin._id,
            }))
            const savedNotifications = await Notification.insertMany(notifications)

            // Emit to each admin
            savedNotifications.forEach((notif) => {
                const targetId = notif.userId.toString()
                emitToUser(targetId, 'newNotification', notif)
            })
        } catch (notifError) {
            console.error('Failed to create admin notifications:', notifError)
        }

        // Broadcast refresh signal for all clients
        emitToAll('rentalsUpdated', { action: 'create', rental })

        res.status(201).json({
            success: true,
            message: 'Rental request created successfully',
            data: { rental },
        })
    } catch (error) {
        next(error)
    }
}

export const updateRental = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Check validation errors
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            })
            return
        }

        const { id } = req.params
        const user = req.user
        const { startDate, endDate, status } = req.body

        // Fetch existing rental to check permissions
        const existingRental = await RentalRequest.findById(id)
        if (!existingRental) {
            res.status(404).json({
                success: false,
                message: 'Rental request not found',
            })
            return
        }

        // Permission check for non-admins
        if (user && user.role !== 'admin') {
            // 1. Check ownership
            if (existingRental.userId?.toString() !== user.userId) {
                res.status(403).json({
                    success: false,
                    message: 'You can only update your own rental requests',
                })
                return
            }

            // 2. Check update allowed fields (only status) and value (only cancelled)
            const updateFields = Object.keys(req.body).filter((key) => key !== '_id' && key !== 'id')
            const isOnlyStatusUpdate = updateFields.length === 1 && updateFields[0] === 'status'
            const isStatusCancelled = status === 'cancelled'

            if (!isOnlyStatusUpdate || !isStatusCancelled) {
                res.status(403).json({
                    success: false,
                    message: 'Users can only update the status of their rental requests to cancelled',
                })
                return
            }

            // 3. Check current status allows cancellation
            if (existingRental.status !== 'pending' && existingRental.status !== 'approved') {
                res.status(400).json({
                    success: false,
                    message: `Cannot cancel a rental that is already ${existingRental.status}`,
                })
                return
            }
        }

        // Validate dates if either is provided (usually only by admin)
        if (startDate || endDate) {
            let start = startDate ? new Date(startDate) : new Date(existingRental.startDate)
            let end = endDate ? new Date(endDate) : new Date(existingRental.endDate)

            if (end <= start) {
                res.status(400).json({
                    success: false,
                    message: 'End date must be after start date',
                })
                return
            }
        }

        const rental = await RentalRequest.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        }).populate(['carId', 'userId'])

        if (!rental) {
            res.status(404).json({
                success: false,
                message: 'Rental request not found',
            })
            return
        }

        // Notify relevant parties if status changed
        if (req.body.status) {
            try {
                // Find user to notify
                const userToNotify = rental.userId && 'email' in rental.userId ? rental.userId : null

                if (userToNotify && userToNotify._id.toString() !== req.user?.userId) {
                    const notification = await Notification.create({
                        title: `Your rental request status has been updated to ${rental.status}`,
                        location: 'RentalRequest',
                        locationId: rental._id,
                        userId: userToNotify._id,
                    })

                    // Emit to user
                    const targetId = userToNotify._id.toString()
                    emitToUser(targetId, 'newNotification', notification)
                }

                // If cancelled by user, notify admins
                if (rental.status === 'cancelled') {
                    const admins = await User.find({ role: 'admin' })
                    const customerName = rental.userId && 'username' in rental.userId ? rental.userId.username : 'Unknown Customer'
                    const adminNotifications = admins.map((admin) => ({
                        title: `Rental request from ${customerName} has been cancelled`,
                        location: 'RentalRequest',
                        locationId: rental._id,
                        userId: admin._id,
                    }))
                    const savedAdminNotifs = await Notification.insertMany(adminNotifications)

                    // Emit to each admin
                    savedAdminNotifs.forEach((notif) => {
                        const targetId = notif.userId.toString()
                        emitToUser(targetId, 'newNotification', notif)
                    })
                }
            } catch (notifError) {
                console.error('Failed to create status update notification:', notifError)
            }
        }

        // Broadcast refresh signal
        emitToAll('rentalsUpdated', { action: 'update', rental })

        res.status(200).json({
            success: true,
            message: 'Rental request updated successfully',
            data: { rental },
        })
    } catch (error) {
        next(error)
    }
}

export const deleteRental = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Check validation errors
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            })
            return
        }

        const { id } = req.params

        const rental = await RentalRequest.findByIdAndDelete(id)

        if (!rental) {
            res.status(404).json({
                success: false,
                message: 'Rental request not found',
            })
            return
        }

        res.status(200).json({
            success: true,
            message: 'Rental request deleted successfully',
            data: { rental },
        })

        // Broadcast refresh signal for all clients
        emitToAll('rentalsUpdated', { action: 'delete', rentalId: id })
    } catch (error) {
        next(error)
    }
}
