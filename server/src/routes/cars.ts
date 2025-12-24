import { Router } from 'express'
import { getCars, createCar, updateCar, deleteCar } from '../controllers/carController'
import { authenticate, requireAdmin } from '../middleware/auth'
import { createCarValidation, updateCarValidation, idParamValidation } from '../middleware/validation'

const router = Router()

/**
 * @route   GET /api/cars
 * @desc    Get all cars (with optional filters)
 * @access  Public
 * @query   status, make, model
 */
router.get('/', getCars)

/**
 * @route   POST /api/cars
 * @desc    Create a new car
 * @access  Admin only
 */
router.post('/', authenticate, requireAdmin, createCarValidation, createCar)

/**
 * @route   PUT /api/cars/:id
 * @desc    Update a car
 * @access  Admin only
 */
router.put('/:id', authenticate, requireAdmin, updateCarValidation, updateCar)

/**
 * @route   DELETE /api/cars/:id
 * @desc    Delete a car
 * @access  Admin only
 */
router.delete('/:id', authenticate, requireAdmin, idParamValidation, deleteCar)

export default router
