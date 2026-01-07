import express, { Application } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { connectDatabase } from './config/database'
import routes from './routes'
import { errorHandler } from './middleware/errorHandler'
import { initSocket } from './utils/socket'

// Load environment variables
dotenv.config()

// Create Express app
const app: Application = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 4800

// Initialize Socket.io
initSocket(httpServer)

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    })
})

// API routes
app.use('/api', routes)

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDatabase()

        // Start listening
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`)
            console.log(`📍 Health check: http://localhost:${PORT}/health`)
            console.log(`📍 API endpoint: http://localhost:${PORT}/api`)
        })
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer()
