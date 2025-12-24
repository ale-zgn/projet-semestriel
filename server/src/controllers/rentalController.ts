import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { RentalRequest } from '../models/RentalRequest'

export const getRentals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status } = req.query
        const user = req.user

        // Build filter object
        const filter: any = {}
        if (status) filter.status = status

        // If user is not admin, only show their rentals (by email)
        if (user && user.role !== 'admin') {
            filter.customerEmail = user.email
        }

        const rentals = await RentalRequest.find(filter).populate('carId').sort({ createdAt: -1 })

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
        const rental = await RentalRequest.create(req.body)
        await rental.populate('carId')

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
        const { startDate, endDate } = req.body

        // Validate dates if either is provided
        if (startDate || endDate) {
            let start = startDate ? new Date(startDate) : null
            let end = endDate ? new Date(endDate) : null

            // If only one date is provided, we need to fetch the other from DB
            if (!start || !end) {
                const existingRental = await RentalRequest.findById(id)
                if (!existingRental) {
                    res.status(404).json({
                        success: false,
                        message: 'Rental request not found',
                    })
                    return
                }
                if (!start) start = new Date(existingRental.startDate)
                if (!end) end = new Date(existingRental.endDate)
            }

            if (end! <= start!) {
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
        }).populate('carId')

        if (!rental) {
            res.status(404).json({
                success: false,
                message: 'Rental request not found',
            })
            return
        }

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
    } catch (error) {
        next(error)
    }
}
