import { Router } from 'express'
import { register, login } from '../controllers/authController'
import { registerValidation, loginValidation } from '../middleware/validation'

const router = Router()

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, register)

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, login)

export default router
