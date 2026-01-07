import { useState, useEffect, useCallback } from 'react'
import { Bell, Trash2, Loader2, CarFront, CalendarClock, History } from 'lucide-react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { notificationsAPI, Notification } from '../../services/api'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { subscribeToNotifications } from '../../services/socket'

interface NotificationPopoverProps {
    onNavigate?: (tab: string) => void
}

export function NotificationPopover({ onNavigate }: NotificationPopoverProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await notificationsAPI.getAll()
            if (response.success && response.data) {
                setNotifications(response.data.notifications)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (open) {
            fetchNotifications()
        }
    }, [open, fetchNotifications])

    useEffect(() => {
        const unsubscribe = subscribeToNotifications((newNotif: Notification) => {
            setNotifications((prev) => [newNotif, ...prev])
            toast.info(newNotif.title)
        })
        return () => {
            if (typeof unsubscribe === 'function') unsubscribe()
        }
    }, [])

    const unreadCount = notifications.filter((n) => !n.isOpened).length

    const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation()
        try {
            const response = await notificationsAPI.markAsRead(id)
            if (response.success) {
                setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isOpened: true } : n)))
            }
        } catch (error) {
            toast.error('Failed to mark notification as read')
        }
    }

    const handleDeleteAll = async () => {
        try {
            const response = await notificationsAPI.deleteAll()
            if (response.success) {
                setNotifications([])
                toast.success('All notifications deleted')
            }
        } catch (error) {
            toast.error('Failed to delete all notifications')
        }
    }

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isOpened) {
            await handleMarkAsRead(notification._id)
        }

        // Navigation logic
        if (notification.location === 'RentalRequest') {
            if (onNavigate) {
                onNavigate('rentals')
            }
            setOpen(false)
        }
    }

    const getIcon = (location: string) => {
        switch (location) {
            case 'RentalRequest':
                return <CalendarClock className='h-4 w-4 text-blue-500' />
            case 'Car':
                return <CarFront className='h-4 w-4 text-green-500' />
            default:
                return <History className='h-4 w-4 text-muted-foreground' />
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant='outline' size='icon' className='relative h-8 w-8 shrink-0'>
                    <Bell className='h-4 w-4' />
                    {unreadCount > 0 && (
                        <Badge variant='destructive' className='absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 flex items-center justify-center text-[10px]'>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80 p-0 dark border-border bg-card' align='end'>
                <div className='flex items-center justify-between p-4 border-b'>
                    <h4 className='font-semibold'>Notifications</h4>
                    <div className='flex items-center gap-2'>
                        {isLoading && <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />}
                        {notifications.length > 0 && (
                            <Button
                                variant='ghost'
                                size='sm'
                                className='h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10'
                                onClick={handleDeleteAll}>
                                <Trash2 className='h-3.5 w-3.5 mr-1' />
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>
                <ScrollArea className='h-[400px]'>
                    {notifications.length === 0 ? (
                        <div className='flex flex-col items-center justify-center h-40 text-muted-foreground'>
                            <Bell className='h-8 w-8 mb-2 opacity-20' />
                            <p className='text-sm'>No notifications yet</p>
                        </div>
                    ) : (
                        <div className='grid divide-y'>
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer relative group flex gap-3 ${
                                        !notification.isOpened ? 'bg-primary/5' : ''
                                    }`}>
                                    <div className='mt-1 shrink-0'>{getIcon(notification.location)}</div>
                                    <div className='flex-1 pr-2'>
                                        <p className={`text-sm leading-tight ${!notification.isOpened ? 'font-semibold' : ''}`}>{notification.title}</p>
                                        <p className='text-xs text-muted-foreground mt-1'>
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!notification.isOpened && <div className='absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full' />}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
