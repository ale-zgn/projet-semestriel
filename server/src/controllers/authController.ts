import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { User } from '../models/User'
import { Notification } from '../models/Notification'
import { generateToken } from '../utils/jwt'
import { emitToUser, emitToAll } from '../utils/socket'

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

        const { username, email, password, role } = req.body

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] })
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User with this email or username already exists',
            })
            return
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password,
            role: role || 'user', // Default to 'user' if not specified
        })

        // Generate token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        })

        // Notify admins
        try {
            const admins = await User.find({ role: 'admin' })
            const notifications = admins.map((admin) => ({
                title: `New user registered: ${user.username}`,
                location: 'User',
                locationId: user._id,
                userId: admin._id,
            }))
            const savedNotifications = await Notification.insertMany(notifications)

            // Emit to each admin
            savedNotifications.forEach((notif) => {
                const targetId = notif.userId.toString()
                console.log(`📡 Notifying admin room: ${targetId} of new user ${user.username} (Notif ID: ${notif._id})`)
                emitToUser(targetId, 'newNotification', notif)
            })
        } catch (notifError) {
            console.error('Failed to create admin registration notifications:', notifError)
        }

        // Broadcast refresh signal for admins
        emitToAll('usersUpdated', { action: 'register', user: { id: user._id, username: user.username } })

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            },
        })
    } catch (error) {
        next(error)
    }
}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

        const { email, password } = req.body

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password')
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            })
            return
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password)
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            })
            return
        }

        // Generate token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        })

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            },
        })
    } catch (error) {
        next(error)
    }
}
