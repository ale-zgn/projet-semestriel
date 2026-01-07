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

        socket.on('join', (userId: string) => {
            console.log(`User ${userId} joined their room`)
            socket.join(userId)

            // Track socket IDs for private messaging if needed
            const currentSockets = userSockets.get(userId) || []
            userSockets.set(userId, [...currentSockets, socket.id])
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

export const emitToUser = (userId: string, event: string, data: any) => {
    if (io) {
        io.to(userId).emit(event, data)
    }
}

export const emitToAll = (event: string, data: any) => {
    if (io) {
        io.emit(event, data)
    }
}
