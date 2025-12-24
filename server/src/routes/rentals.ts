import { Router } from 'express'
import { getRentals, createRental, updateRental, deleteRental } from '../controllers/rentalController'
import { authenticate, requireAdmin } from '../middleware/auth'
import { createRentalValidation, updateRentalValidation, idParamValidation } from '../middleware/validation'

const router = Router()

/**
 * @route   GET /api/rentals
 * @desc    Get all rental requests
 * @access  Authenticated (admin sees all, users see their own)
 * @query   status
 */
router.get('/', authenticate, getRentals)

/**
 * @route   POST /api/rentals
 * @desc    Create a new rental request
 * @access  Authenticated
 */
router.post('/', authenticate, createRentalValidation, createRental)

/**
 * @route   PUT /api/rentals/:id
 * @desc    Update a rental request (change status)
 * @access  Admin only
 */
router.put('/:id', authenticate, requireAdmin, updateRentalValidation, updateRental)

/**
 * @route   DELETE /api/rentals/:id
 * @desc    Delete a rental request
 * @access  Admin only
 */
router.delete('/:id', authenticate, requireAdmin, idParamValidation, deleteRental)

export default router
