import { body, param, ValidationChain } from 'express-validator'

// Auth validation
export const registerValidation: ValidationChain[] = [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

export const loginValidation: ValidationChain[] = [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
]

// Car validation
export const createCarValidation: ValidationChain[] = [
    body('make').trim().notEmpty().withMessage('Car make is required'),
    body('carModel').trim().notEmpty().withMessage('Car model is required'),
    body('year')
        .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
        .withMessage('Invalid year'),
    body('color').trim().notEmpty().withMessage('Color is required'),
    body('dailyRate').isFloat({ min: 0 }).withMessage('Daily rate must be a positive number'),
    body('mileage').isInt({ min: 0 }).withMessage('Mileage must be a positive number'),
    body('licensePlate').trim().notEmpty().withMessage('License plate is required'),
    body('status').optional().isIn(['available', 'rented', 'maintenance']).withMessage('Invalid status'),
]

export const updateCarValidation: ValidationChain[] = [
    param('id').isMongoId().withMessage('Invalid car ID'),
    body('make').optional().trim().notEmpty().withMessage('Car make cannot be empty'),
    body('carModel').optional().trim().notEmpty().withMessage('Car model cannot be empty'),
    body('year')
        .optional()
        .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
        .withMessage('Invalid year'),
    body('color').optional().trim().notEmpty().withMessage('Color cannot be empty'),
    body('dailyRate').optional().isFloat({ min: 0 }).withMessage('Daily rate must be a positive number'),
    body('mileage').optional().isInt({ min: 0 }).withMessage('Mileage must be a positive number'),
    body('licensePlate').optional().trim().notEmpty().withMessage('License plate cannot be empty'),
    body('status').optional().isIn(['available', 'rented', 'maintenance']).withMessage('Invalid status'),
]

// Rental validation
export const createRentalValidation: ValidationChain[] = [
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('customerEmail').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('customerPhone').trim().notEmpty().withMessage('Customer phone is required'),
    body('carId').isMongoId().withMessage('Invalid car ID'),
    body('startDate').isISO8601().withMessage('Invalid start date'),
    body('endDate').isISO8601().withMessage('Invalid end date'),
    body('totalCost').isFloat({ min: 0 }).withMessage('Total cost must be a positive number'),
    body('notes').optional().trim(),
]

export const updateRentalValidation: ValidationChain[] = [
    param('id').isMongoId().withMessage('Invalid rental ID'),
    body('status').optional().isIn(['pending', 'approved', 'completed', 'rejected']).withMessage('Invalid status'),
    body('notes').optional().trim(),
]

export const idParamValidation: ValidationChain[] = [param('id').isMongoId().withMessage('Invalid ID')]
