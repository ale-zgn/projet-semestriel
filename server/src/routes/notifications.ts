import { Router } from 'express'
import { getUserNotifications, markAsRead, deleteNotification, deleteAllNotifications } from '../controllers/notificationController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, getUserNotifications)
router.patch('/:id/read', authenticate, markAsRead)
router.delete('/', authenticate, deleteAllNotifications)
router.delete('/:id', authenticate, deleteNotification)

export default router
