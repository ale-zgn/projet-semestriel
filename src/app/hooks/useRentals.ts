import { useState, useEffect, useCallback } from 'react'
import { rentalsAPI, RentalRequest } from '../../services/api'
import { toast } from 'sonner'

export function useRentals() {
    const [rentals, setRentals] = useState<RentalRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchRentals = useCallback(async (filters?: { status?: string }) => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await rentalsAPI.getAll(filters)

            if (response.success && response.data) {
                setRentals(response.data.rentals)
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to fetch rentals'
            setError(message)
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchRentals()
    }, [fetchRentals])

    const addRental = async (rentalData: Omit<RentalRequest, '_id' | 'createdAt' | 'updatedAt' | 'status'>) => {
        try {
            const response = await rentalsAPI.create(rentalData)

            if (response.success && response.data) {
                setRentals((prev) => [...prev, response.data!.rental])
                toast.success(`Rental request for ${rentalData.customerName} created successfully!`)
                return true
            }
            return false
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to create rental'
            toast.error(message)
            return false
        }
    }

    const updateRental = async (id: string, rentalData: Partial<RentalRequest>) => {
        try {
            const response = await rentalsAPI.update(id, rentalData)

            if (response.success && response.data) {
                setRentals((prev) => prev.map((rental) => (rental._id === id ? response.data!.rental : rental)))
                toast.success('Rental request updated successfully!')
                return true
            }
            return false
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update rental'
            toast.error(message)
            return false
        }
    }

    const deleteRental = async (id: string) => {
        try {
            const response = await rentalsAPI.delete(id)

            if (response.success) {
                setRentals((prev) => prev.filter((rental) => rental._id !== id))
                toast.success('Rental request deleted successfully!')
                return true
            }
            return false
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to delete rental'
            toast.error(message)
            return false
        }
    }

    return {
        rentals,
        isLoading,
        error,
        fetchRentals,
        addRental,
        updateRental,
        deleteRental,
    }
}
