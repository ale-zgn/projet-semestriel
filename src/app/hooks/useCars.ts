import { useState, useEffect, useCallback } from 'react'
import { carsAPI, Car } from '../../services/api'
import { toast } from 'sonner'
import { subscribeToEvent } from '../../services/socket'

export function useCars() {
    const [cars, setCars] = useState<Car[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCars = useCallback(async (filters?: { status?: string; make?: string; model?: string }) => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await carsAPI.getAll(filters)

            if (response.success && response.data) {
                setCars(response.data.cars)
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to fetch cars'
            setError(message)
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCars()
    }, [fetchCars])

    useEffect(() => {
        const unsubscribe = subscribeToEvent('carsUpdated', (data) => {
            console.log('🏎️ useCars hook received carsUpdated event:', data)
            fetchCars()
        })
        return () => {
            if (unsubscribe) unsubscribe()
        }
    }, [fetchCars])

    const addCar = async (carData: Omit<Car, '_id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const response = await carsAPI.create(carData)

            if (response.success && response.data) {
                setCars((prev) => [...prev, response.data!.car])
                toast.success(`${carData.make} ${carData.carModel} added successfully!`)
                return true
            }
            return false
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to add car'
            toast.error(message)
            return false
        }
    }

    const updateCar = async (id: string, carData: Partial<Car>) => {
        try {
            const response = await carsAPI.update(id, carData)

            if (response.success && response.data) {
                setCars((prev) => prev.map((car) => (car._id === id ? response.data!.car : car)))
                toast.success('Car updated successfully!')
                return true
            }
            return false
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update car'
            toast.error(message)
            return false
        }
    }

    const deleteCar = async (id: string) => {
        try {
            const response = await carsAPI.delete(id)

            if (response.success) {
                setCars((prev) => prev.filter((car) => car._id !== id))
                toast.success('Car deleted successfully!')
                return true
            }
            return false
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to delete car'
            toast.error(message)
            return false
        }
    }

    return {
        cars,
        isLoading,
        error,
        fetchCars,
        addCar,
        updateCar,
        deleteCar,
    }
}
