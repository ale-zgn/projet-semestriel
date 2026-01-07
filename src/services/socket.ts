import { io, Socket } from 'socket.io-client'

// @ts-ignore
const SOCKET_URL = import.meta.env?.VITE_API_URL || 'http://localhost:4800'

let socket: Socket | null = null

export const initiateSocketConnection = (userId: string) => {
    socket = io(SOCKET_URL)
    console.log(`Connecting socket...`)
    if (socket && userId) socket.emit('join', userId)
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
