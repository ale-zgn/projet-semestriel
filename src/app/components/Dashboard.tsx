import { CarsTab } from './CarsTab'
import { RentalRequestsTab } from './RentalRequestsTab'
import { UsersTab } from './UsersTab'
import { NotificationPopover } from './NotificationPopover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Button } from './ui/button'
import { LogOut, User as UserIcon } from 'lucide-react'
import { Toaster } from 'sonner'
import { useCars } from '../hooks/useCars'
import { useRentals } from '../hooks/useRentals'
import { useUsers } from '../hooks/useUsers'
import { User } from '../../services/api'
import { useEffect, useState } from 'react'
import { initiateSocketConnection, disconnectSocket } from '../../services/socket'

interface DashboardProps {
    user: User | null
    logout: () => void
}

export function Dashboard({ user, logout }: DashboardProps) {
    const [activeTab, setActiveTab] = useState('cars')
    const { cars, isLoading: carsLoading, addCar, updateCar, deleteCar } = useCars()
    const { rentals, isLoading: rentalsLoading, addRental, updateRental, deleteRental } = useRentals()
    const { users, isLoading: usersLoading } = useUsers(user?.role === 'admin')

    useEffect(() => {
        if (user?.id) {
            initiateSocketConnection(user.id)
        }
        return () => {
            disconnectSocket()
        }
    }, [user?.id])

    const handleAddCar = async (carData: any) => {
        await addCar(carData)
    }

    const handleUpdateCar = async (updatedCar: any) => {
        await updateCar(updatedCar._id, updatedCar)
    }

    const handleDeleteCar = async (id: string) => {
        await deleteCar(id)
    }

    const handleAddRental = async (rentalData: any) => {
        await addRental(rentalData)
    }

    const handleUpdateRental = async (updatedRental: any) => {
        await updateRental(updatedRental._id, updatedRental)
    }

    const handleDeleteRental = async (id: string) => {
        await deleteRental(id)
    }

    return (
        <div className='min-h-screen bg-background dark'>
            <Toaster position='top-right' />
            <header className='border-b border-border bg-card'>
                <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
                    <div>
                        <h1>Car Rental Manager</h1>
                        <p className='text-muted-foreground'>Manage your fleet and rental requests</p>
                    </div>
                    <div className='flex items-center gap-4'>
                        {user && (
                            <div className='flex items-center gap-2 text-sm text-muted-foreground text-right'>
                                <span className='font-medium text-foreground'>{user.username}</span>
                                {user.role === 'admin' && <span className='px-2 py-1 bg-primary/10 text-primary rounded text-xs'>Admin</span>}
                            </div>
                        )}
                        <NotificationPopover onNavigate={(tab: string) => setActiveTab(tab)} />
                        <Button variant='outline' onClick={logout}>
                            <LogOut className='size-4 mr-2' />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className='container mx-auto px-4 py-8'>
                <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
                    <TabsList className={`grid w-full max-w-md ${user?.role === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        <TabsTrigger value='cars'>Cars ({carsLoading ? '...' : cars.length})</TabsTrigger>
                        <TabsTrigger value='rentals'>Rental Requests ({rentalsLoading ? '...' : rentals.length})</TabsTrigger>
                        {user?.role === 'admin' && <TabsTrigger value='users'>Users ({usersLoading ? '...' : users.length})</TabsTrigger>}
                    </TabsList>

                    <TabsContent value='cars' className='space-y-4'>
                        <CarsTab
                            cars={cars}
                            onAddCar={handleAddCar}
                            onUpdateCar={handleUpdateCar}
                            onDeleteCar={handleDeleteCar}
                            isLoading={carsLoading}
                            isAdmin={user?.role === 'admin'}
                        />
                    </TabsContent>

                    <TabsContent value='rentals' className='space-y-4'>
                        <RentalRequestsTab
                            rentals={rentals}
                            cars={cars}
                            onAddRental={handleAddRental}
                            onUpdateRental={handleUpdateRental}
                            onDeleteRental={handleDeleteRental}
                            isLoading={rentalsLoading}
                            isAdmin={user?.role === 'admin'}
                            user={user}
                        />
                    </TabsContent>

                    {user?.role === 'admin' && (
                        <TabsContent value='users' className='space-y-4'>
                            <UsersTab users={users} isLoading={usersLoading} />
                        </TabsContent>
                    )}
                </Tabs>
            </main>
        </div>
    )
}
