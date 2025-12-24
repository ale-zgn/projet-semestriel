import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'

interface ErrorResponse {
    success: false
    message: string
    errors?: any
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    console.error('Error:', err)

    let statusCode = err.statusCode || 500
    let message = err.message || 'Internal server error'
    let errors = null

    // Mongoose validation error
    if (err instanceof mongoose.Error.ValidationError) {
        statusCode = 400
        message = 'Validation error'
        errors = Object.values(err.errors).map((e: any) => ({
            field: e.path,
            message: e.message,
        }))
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400
        message = 'Duplicate field value'
        const field = Object.keys(err.keyPattern)[0]
        errors = [
            {
                field,
                message: `${field} already exists`,
            },
        ]
    }

    // Mongoose cast error (invalid ObjectId)
    if (err instanceof mongoose.Error.CastError) {
        statusCode = 400
        message = 'Invalid ID format'
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401
        message = 'Invalid token'
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401
        message = 'Token expired'
    }

    const response: ErrorResponse = {
        success: false,
        message,
    }

    if (errors) {
        response.errors = errors
    }

    res.status(statusCode).json(response)
}
