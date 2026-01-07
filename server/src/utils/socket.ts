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
        socket.on('join', async (userId: any) => {
            const userIdStr = String(userId)
            await socket.join(userIdStr)

            // Track socket IDs
            const currentSockets = userSockets.get(userIdStr) || []
            userSockets.set(userIdStr, [...currentSockets, socket.id])
        })

        socket.on('disconnect', () => {
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
        io.to(userIdStr).emit(event, data)
    }
}

export const emitToAll = (event: string, data: any) => {
    if (io) {
        io.emit(event, data)
    }
}
