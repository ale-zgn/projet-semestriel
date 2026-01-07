import { io, Socket } from 'socket.io-client'

// @ts-ignore
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:4800/api'
const SOCKET_URL = API_URL.replace('/api', '')

let socket: Socket | null = null

export const initiateSocketConnection = (userId: string) => {
    socket = io(SOCKET_URL)
    console.log(`Socket connecting to ${SOCKET_URL} for user ${userId}...`)

    if (socket) {
        socket.on('connect', () => {
            console.log('Socket connected successfully:', socket?.id)
            if (userId) socket?.emit('join', userId)
        })

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
        })
    }
}

export const disconnectSocket = () => {
    console.log('Disconnecting socket...')
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

export const subscribeToNotifications = (cb: (data: any) => void) => {
    if (!socket) return null
    socket.on('newNotification', cb)
    return () => socket?.off('newNotification', cb)
}

export const subscribeToEvent = (event: string, cb: (data: any) => void) => {
    if (!socket) return null
    socket.on(event, cb)
    return () => socket?.off(event, cb)
}
