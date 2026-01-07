import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4800/api'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Types
export interface User {
    id: string
    username: string
    email: string
    phone?: string
    role: 'admin' | 'user'
    rentalCount?: number
}

export interface Car {
    _id: string
    make: string
    carModel: string
    year: number
    color: string
    status: 'available' | 'rented' | 'maintenance'
    dailyRate: number
    mileage: number
    licensePlate: string
    createdAt: string
    updatedAt: string
}

export interface RentalRequest {
    _id: string
    userId: User | string
    carId: Car | string
    startDate: string
    endDate: string
    status: 'pending' | 'approved' | 'completed' | 'rejected'
    notes?: string
    totalCost: number
    createdAt: string
    updatedAt: string
}

export interface ApiResponse<T> {
    success: boolean
    message: string
    data?: T
    errors?: any[]
}

// Auth API
export const authAPI = {
    register: async (username: string, email: string, password: string, role?: string) => {
        const response = await apiClient.post<ApiResponse<{ token: string; user: User }>>('/auth/register', { username, email, password, role })
        return response.data
    },

    login: async (email: string, password: string) => {
        const response = await apiClient.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password })
        return response.data
    },
}

// Cars API
export const carsAPI = {
    getAll: async (filters?: { status?: string; make?: string; model?: string; startDate?: string; endDate?: string }) => {
        const response = await apiClient.get<ApiResponse<{ cars: Car[]; count: number }>>('/cars', { params: filters })
        return response.data
    },

    create: async (carData: Omit<Car, '_id' | 'createdAt' | 'updatedAt'>) => {
        const response = await apiClient.post<ApiResponse<{ car: Car }>>('/cars', carData)
        return response.data
    },

    update: async (id: string, carData: Partial<Car>) => {
        const response = await apiClient.put<ApiResponse<{ car: Car }>>(`/cars/${id}`, carData)
        return response.data
    },

    delete: async (id: string) => {
        const response = await apiClient.delete<ApiResponse<{ car: Car }>>(`/cars/${id}`)
        return response.data
    },
}

// Rentals API
export const rentalsAPI = {
    getAll: async (filters?: { status?: string; carId?: string }) => {
        const response = await apiClient.get<ApiResponse<{ rentals: RentalRequest[]; count: number }>>('/rentals', { params: filters })
        return response.data
    },

    create: async (rentalData: Omit<RentalRequest, '_id' | 'createdAt' | 'updatedAt' | 'status'>) => {
        const response = await apiClient.post<ApiResponse<{ rental: RentalRequest }>>('/rentals', rentalData)
        return response.data
    },

    update: async (id: string, rentalData: Partial<RentalRequest>) => {
        const response = await apiClient.put<ApiResponse<{ rental: RentalRequest }>>(`/rentals/${id}`, rentalData)
        return response.data
    },

    delete: async (id: string) => {
        const response = await apiClient.delete<ApiResponse<{ rental: RentalRequest }>>(`/rentals/${id}`)
        return response.data
    },
}

// Notifications API
export interface Notification {
    _id: string
    title: string
    location: string
    locationId: string
    isOpened: boolean
    userId: string
    createdAt: string
    updatedAt: string
}

export const notificationsAPI = {
    getAll: async () => {
        const response = await apiClient.get<ApiResponse<{ notifications: Notification[] }>>('/notifications')
        return response.data
    },

    markAsRead: async (id: string) => {
        const response = await apiClient.patch<ApiResponse<{ notification: Notification }>>(`/notifications/${id}/read`)
        return response.data
    },

    delete: async (id: string) => {
        const response = await apiClient.delete<ApiResponse<null>>(`/notifications/${id}`)
        return response.data
    },

    deleteAll: async () => {
        const response = await apiClient.delete<ApiResponse<null>>('/notifications')
        return response.data
    },
}

// Users API
export const usersAPI = {
    getAll: async () => {
        const response = await apiClient.get<ApiResponse<{ users: User[]; count: number }>>('/users')
        return response.data
    },
}

// Auth helpers
export const setAuthToken = (token: string) => {
    localStorage.setItem('authToken', token)
}

export const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken')
}

export const removeAuthToken = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
}

export const setUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user))
}

export const getUser = (): User | null => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
}

export default apiClient
