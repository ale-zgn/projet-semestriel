import { Router } from 'express'
import authRoutes from './auth'
import carRoutes from './cars'
import rentalRoutes from './rentals'
import userRoutes from './users'
import notificationRoutes from './notifications'

const router = Router()

// Mount routes
router.use('/auth', authRoutes)
router.use('/cars', carRoutes)
router.use('/rentals', rentalRoutes)
router.use('/users', userRoutes)
router.use('/notifications', notificationRoutes)

export default router
