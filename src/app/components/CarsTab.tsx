import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog'
import { CarFormDialog } from './CarFormDialog'
import { Plus, MoreVertical, Search, Filter, Loader2 } from 'lucide-react'
import { Car, rentalsAPI } from '../../services/api'

interface CarsTabProps {
    cars: Car[]
    onAddCar: (car: any) => Promise<void>
    onUpdateCar: (car: any) => Promise<void>
    onDeleteCar: (id: string) => Promise<void>
    isLoading: boolean
    isAdmin: boolean
}

export function CarsTab({ cars, onAddCar, onUpdateCar, onDeleteCar, isLoading, isAdmin }: CarsTabProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCar, setEditingCar] = useState<Car | undefined>()
    const [deleteCarId, setDeleteCarId] = useState<string | null>(null)
    const [rentalCount, setRentalCount] = useState<number>(0)
    const [isCheckingRentals, setIsCheckingRentals] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const filteredCars = cars.filter((car) => {
        const matchesSearch =
            car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
            car.carModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
            car.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || car.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const handleSave = async (carData: any) => {
        if (carData._id) {
            await onUpdateCar(carData)
        } else {
            await onAddCar(carData)
        }
        setEditingCar(undefined)
    }

    const handleEdit = (car: Car) => {
        setEditingCar(car)
        setIsDialogOpen(true)
    }

    const handleDelete = async () => {
        if (deleteCarId) {
            await onDeleteCar(deleteCarId)
            setDeleteCarId(null)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'rented':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'maintenance':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            default:
                return ''
        }
    }

    if (isLoading && cars.length === 0) {
        return (
            <div className='flex justify-center py-12'>
                <Loader2 className='size-8 animate-spin text-primary' />
            </div>
        )
    }

    return (
        <div className='space-y-4'>
            <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <div>
                    <h2>Cars</h2>
                    <p className='text-muted-foreground'>{isAdmin ? 'Manage your vehicle fleet' : 'View vehicles'}</p>
                </div>
                {isAdmin && (
                    <Button
                        onClick={() => {
                            setEditingCar(undefined)
                            setIsDialogOpen(true)
                        }}>
                        <Plus className='size-4 mr-2' />
                        Add Car
                    </Button>
                )}
            </div>

            <div className='flex flex-col sm:flex-row gap-4'>
                <div className='relative flex-1'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground' />
                    <Input
                        placeholder='Search by make, model, or license plate...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='pl-10'
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className='w-full sm:w-[180px]'>
                        <Filter className='size-4 mr-2' />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>All Status</SelectItem>
                        <SelectItem value='available'>Available</SelectItem>
                        <SelectItem value='rented'>Rented</SelectItem>
                        <SelectItem value='maintenance'>Maintenance</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {filteredCars.map((car) => (
                    <Card key={car._id} className='hover:border-primary/50 transition-colors'>
                        <CardHeader className='pb-3'>
                            <div className='flex items-start justify-between'>
                                <div className='space-y-1'>
                                    <CardTitle>
                                        {car.make} {car.carModel}
                                    </CardTitle>
                                    <CardDescription>
                                        {car.year} • {car.color}
                                    </CardDescription>
                                </div>
                                {isAdmin && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant='ghost' size='sm'>
                                                <MoreVertical className='size-4' />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align='end'>
                                            <DropdownMenuItem onClick={() => handleEdit(car)}>Edit</DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={async () => {
                                                    const targetCarId = car._id
                                                    setDeleteCarId(targetCarId)
                                                    setIsCheckingRentals(true)
                                                    try {
                                                        const response = await rentalsAPI.getAll({ carId: targetCarId })
                                                        if (response.success && response.data) {
                                                            const associatedRentals = response.data.rentals.filter((rental) => {
                                                                const rentalCarId = typeof rental.carId === 'object' ? rental.carId._id : rental.carId
                                                                return rentalCarId === targetCarId
                                                            })
                                                            setRentalCount(associatedRentals.length)
                                                        }
                                                    } catch (error) {
                                                        console.error('Failed to check rentals', error)
                                                        setRentalCount(0)
                                                    } finally {
                                                        setIsCheckingRentals(false)
                                                    }
                                                }}
                                                className='text-destructive'>
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                            <div className='flex items-center justify-between'>
                                <span className='text-muted-foreground'>License Plate</span>
                                <span>{car.licensePlate}</span>
                            </div>
                            <div className='flex items-center justify-between'>
                                <span className='text-muted-foreground'>Daily Rate</span>
                                <span>${car.dailyRate.toFixed(2)}</span>
                            </div>
                            <div className='flex items-center justify-between'>
                                <span className='text-muted-foreground'>Mileage</span>
                                <span>{car.mileage.toLocaleString()} mi</span>
                            </div>
                            <div className='flex items-center justify-between'>
                                <span className='text-muted-foreground'>Status</span>
                                <Badge variant='outline' className={getStatusColor(car.status)}>
                                    {car.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredCars.length === 0 && (
                <Card>
                    <CardContent className='flex flex-col items-center justify-center py-16'>
                        <p className='text-muted-foreground text-center'>
                            {searchQuery || statusFilter !== 'all' ? 'No cars found matching your filters' : 'No cars added yet.'}
                        </p>
                    </CardContent>
                </Card>
            )}

            <CarFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} car={editingCar} onSave={handleSave} />

            <AlertDialog open={deleteCarId !== null} onOpenChange={() => setDeleteCarId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {isCheckingRentals ? (
                                <span className='flex items-center gap-2'>
                                    <Loader2 className='size-4 animate-spin' /> Checking for associated rentals...
                                </span>
                            ) : rentalCount > 0 ? (
                                <span className='text-red-500 font-medium'>
                                    Warning: This car has {rentalCount} rental request(s) associated with it. Deleting this car will also permanently delete all
                                    these rental requests.
                                </span>
                            ) : (
                                'This action cannot be undone. This will permanently delete the car from your fleet.'
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
