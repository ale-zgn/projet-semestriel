import { Request, Response, NextFunction } from 'express'
import { User } from '../models/User'
import { RentalRequest } from '../models/RentalRequest'

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 })

        const usersWithRentals = await Promise.all(
            users.map(async (user) => {
                const rentalCount = await RentalRequest.countDocuments({ customerEmail: user.email })
                return {
                    ...user.toObject(),
                    rentalCount,
                }
            })
        )

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users: usersWithRentals,
                count: users.length,
            },
        })
    } catch (error) {
        next(error)
    }
}
