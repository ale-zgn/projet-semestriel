import { useState, useEffect } from 'react'
import { authAPI, User } from '../../services/api'
import { toast } from 'sonner'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        // Check if user is already logged in
        const storedUser = localStorage.getItem('user')
        const token = localStorage.getItem('authToken')

        if (storedUser && token) {
            setUser(JSON.parse(storedUser))
            setIsAuthenticated(true)
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true)
            const response = await authAPI.login(email, password)

            if (response.success && response.data) {
                const { token, user } = response.data
                localStorage.setItem('authToken', token)
                localStorage.setItem('user', JSON.stringify(user))
                setUser(user)
                setIsAuthenticated(true)
                toast.success('Welcome back! Successfully logged in.')
                return true
            }
            return false
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed'
            toast.error(message)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (username: string, email: string, password: string) => {
        try {
            setIsLoading(true)
            const response = await authAPI.register(username, email, password)

            if (response.success && response.data) {
                const { token, user } = response.data
                localStorage.setItem('authToken', token)
                localStorage.setItem('user', JSON.stringify(user))
                setUser(user)
                setIsAuthenticated(true)
                toast.success('Account created successfully!')
                return true
            }
            return false
        } catch (error: any) {
            const message = error.response?.data?.message || 'Registration failed'
            toast.error(message)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        setUser(null)
        setIsAuthenticated(false)
        toast.info('You have been logged out.')
    }

    return {
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
    }
}
