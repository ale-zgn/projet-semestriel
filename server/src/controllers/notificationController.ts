import { Request, Response, NextFunction } from 'express'
import { Notification } from '../models/Notification'

export const getUserNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' })
            return
        }

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50)

        res.status(200).json({
            success: true,
            message: 'Notifications retrieved successfully',
            data: { notifications },
        })
    } catch (error) {
        next(error)
    }
}

export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params
        const userId = req.user?.userId

        const notification = await Notification.findOneAndUpdate({ _id: id, userId }, { isOpened: true }, { new: true })

        if (!notification) {
            res.status(404).json({ success: false, message: 'Notification not found' })
            return
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: { notification },
        })
    } catch (error) {
        next(error)
    }
}

export const deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params
        const userId = req.user?.userId

        const notification = await Notification.findOneAndDelete({ _id: id, userId })

        if (!notification) {
            res.status(404).json({ success: false, message: 'Notification not found' })
            return
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
        })
    } catch (error) {
        next(error)
    }
}

export const deleteAllNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' })
            return
        }

        await Notification.deleteMany({ userId })

        res.status(200).json({
            success: true,
            message: 'All notifications deleted successfully',
        })
    } catch (error) {
        next(error)
    }
}
