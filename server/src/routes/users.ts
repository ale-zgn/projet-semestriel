import { Router } from 'express'
import { getUsers } from '../controllers/userController'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = Router()

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get('/', authenticate, requireAdmin, getUsers)

export default router
