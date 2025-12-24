import { Request, Response, NextFunction } from 'express'
import { verifyToken, JwtPayload } from '../utils/jwt'

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'No token provided',
            })
            return
        }

        const token = authHeader.substring(7) // Remove 'Bearer ' prefix

        const decoded = verifyToken(token)
        req.user = decoded

        next()
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        })
    }
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
        })
        return
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({
            success: false,
            message: 'Admin access required',
        })
        return
    }

    next()
}

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            const decoded = verifyToken(token)
            req.user = decoded
        }

        next()
    } catch (error) {
        // If token is invalid, continue without user
        next()
    }
}
