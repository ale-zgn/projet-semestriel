import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { Car } from '../models/Car'
import { RentalRequest } from '../models/RentalRequest'
import { emitToAll } from '../utils/socket'

export const getCars = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status, make, model, startDate, endDate } = req.query

        // Build filter object
        const filter: any = {}
        if (status && status !== 'all') filter.status = status
        if (make) filter.make = new RegExp(make as string, 'i')
        if (model) filter.carModel = new RegExp(model as string, 'i')

        let cars = await Car.find(filter).sort({ createdAt: -1 })

        // If date range is provided, check for availability
        if (startDate && endDate) {
            const start = new Date(startDate as string)
            const end = new Date(endDate as string)

            // Find all approved rentals that overlap with the requested period
            const overlappingRentals = await RentalRequest.find({
                status: 'approved',
                $or: [
                    { startDate: { $lte: end }, endDate: { $gte: start } }, // Overlap condition
                ],
            })

            const rentedCarIds = overlappingRentals.map((rental) => rental.carId.toString())

            // Modify car status to 'rented' if it has an overlapping rental
            cars = cars.map((car) => {
                if (rentedCarIds.includes(car._id.toString())) {
                    // Clone the car object to modify it without saving to DB
                    const carObj = car.toObject()
                    carObj.status = 'rented'
                    return carObj as any
                }
                return car
            })
        }

        res.status(200).json({
            success: true,
            message: 'Cars retrieved successfully',
            data: {
                cars,
                count: cars.length,
            },
        })
    } catch (error) {
        next(error)
    }
}

export const createCar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

        const car = await Car.create(req.body)

        // Socket emission
        emitToAll('carsUpdated', { action: 'create', car })

        res.status(201).json({
            success: true,
            message: 'Car created successfully',
            data: { car },
        })
    } catch (error) {
        next(error)
    }
}

export const updateCar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

        const car = await Car.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        })

        if (!car) {
            res.status(404).json({
                success: false,
                message: 'Car not found',
            })
            return
        }

        res.status(200).json({
            success: true,
            message: 'Car updated successfully',
            data: { car },
        })

        // Socket emission
        emitToAll('carsUpdated', { action: 'update', car })
    } catch (error) {
        next(error)
    }
}

export const deleteCar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

        const car = await Car.findByIdAndDelete(id)

        if (!car) {
            res.status(404).json({
                success: false,
                message: 'Car not found',
            })
            return
        }

        // Delete associated rental requests
        await RentalRequest.deleteMany({ carId: id })

        res.status(200).json({
            success: true,
            message: 'Car deleted successfully',
            data: { car },
        })

        // Socket emission
        emitToAll('carsUpdated', { action: 'delete', carId: id })
    } catch (error) {
        next(error)
    }
}
