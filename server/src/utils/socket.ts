import { Server as SocketIOServer, Socket } from 'socket.io'
import { Server as HTTPServer } from 'http'

let io: SocketIOServer
const userSockets = new Map<string, string[]>() // Map userId to array of socketIds

export const initSocket = (server: HTTPServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: '*', // Adjust this in production
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        },
    })

    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id)

        socket.on('join', async (userId: any) => {
            const userIdStr = String(userId)
            await socket.join(userIdStr)
            console.log(`👤 User ${userIdStr} joined room. Active rooms:`, Array.from(socket.rooms))

            // Track socket IDs
            const currentSockets = userSockets.get(userIdStr) || []
            userSockets.set(userIdStr, [...currentSockets, socket.id])
        })

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id)
            // Clean up userSockets map
            for (const [userId, socketIds] of userSockets.entries()) {
                if (socketIds.includes(socket.id)) {
                    const updatedIds = socketIds.filter((id) => id !== socket.id)
                    if (updatedIds.length === 0) {
                        userSockets.delete(userId)
                    } else {
                        userSockets.set(userId, updatedIds)
                    }
                    break
                }
            }
        })
    })

    return io
}

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized')
    }
    return io
}

export const emitToUser = (userId: any, event: string, data: any) => {
    if (io) {
        const userIdStr = String(userId)
        console.log(`📡 Emitting ${event} to user room: ${userIdStr}`)
        io.to(userIdStr).emit(event, data)
    } else {
        console.warn(`⚠️ Cannot emit ${event} to user ${userId}: Socket.io not initialized`)
    }
}

export const emitToAll = (event: string, data: any) => {
    if (io) {
        console.log(`📢 Broadcasting ${event} to all connected clients`)
        io.emit(event, data)
    } else {
        console.warn(`⚠️ Cannot broadcast ${event}: Socket.io not initialized`)
    }
}
