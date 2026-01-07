import { useState, useEffect, useCallback } from 'react'
import { User, usersAPI } from '../../services/api'
import { toast } from 'sonner'

export function useUsers(enabled: boolean = true) {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(enabled)
    const [error, setError] = useState<string | null>(null)

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await usersAPI.getAll()
            if (response.success && response.data) {
                setUsers(response.data.users)
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch users'
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (enabled) {
            fetchUsers()
        } else {
            setIsLoading(false)
        }
    }, [fetchUsers, enabled])

    return {
        users,
        isLoading,
        error,
        refreshUsers: fetchUsers,
    }
}
