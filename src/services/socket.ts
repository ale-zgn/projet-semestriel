import { io, Socket } from 'socket.io-client'

// @ts-ignore
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:4800/api'
const SOCKET_URL = API_URL.replace('/api', '')

// Create socket immediately with autoConnect: false
export const socket: Socket = io(SOCKET_URL, {
    autoConnect: false,
})

export const initiateSocketConnection = (userId: string) => {
    console.log(`Socket connecting to ${SOCKET_URL} for user ${userId}...`)

    if (!socket.connected) {
        socket.connect()
    }

    // Handle connection events
    socket.off('connect')
    socket.on('connect', () => {
        console.log('✅ Socket connected successfully:', socket.id)
        if (userId) {
            console.log(`👤 Emitting join for user ${userId}`)
            socket.emit('join', userId)
        }
    })

    socket.off('connect_error')
    socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error)
    })

    // If already connected, emit join immediately
    if (socket.connected && userId) {
        socket.emit('join', userId)
    }
}

export const disconnectSocket = () => {
    console.log('🔌 Disconnecting socket...')
    socket.disconnect()
}

export const subscribeToNotifications = (cb: (data: any) => void) => {
    console.log('🔌 Registering listener for: newNotification')
    socket.on('newNotification', cb)
    return () => {
        console.log('🔌 Removing listener for: newNotification')
        socket.off('newNotification', cb)
    }
}

export const subscribeToEvent = (event: string, cb: (data: any) => void) => {
    console.log(`🔌 Registering listener for: ${event}`)
    socket.on(event, cb)
    return () => {
        console.log(`🔌 Removing listener for: ${event}`)
        socket.off(event, cb)
    }
}
