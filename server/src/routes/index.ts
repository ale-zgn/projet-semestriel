import { Router } from 'express'
import authRoutes from './auth'
import carRoutes from './cars'
import rentalRoutes from './rentals'
import userRoutes from './users'

const router = Router()

// Mount routes
router.use('/auth', authRoutes)
router.use('/cars', carRoutes)
router.use('/rentals', rentalRoutes)
router.use('/users', userRoutes)

export default router
