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
import { RentalFormDialog } from './RentalFormDialog'
import { Plus, MoreVertical, Search, Filter, Calendar, User, Mail, Phone, Loader2 } from 'lucide-react'
import { RentalRequest, Car, User as UserType } from '../../services/api'

interface RentalRequestsTabProps {
    rentals: RentalRequest[]
    cars: Car[]
    onAddRental: (rental: any) => Promise<void>
    onUpdateRental: (rental: any) => Promise<void>
    onDeleteRental: (id: string) => Promise<void>
    isLoading: boolean
    isAdmin: boolean
    user: UserType | null
}

export function RentalRequestsTab({ rentals, cars, onAddRental, onUpdateRental, onDeleteRental, isLoading, isAdmin, user }: RentalRequestsTabProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingRental, setEditingRental] = useState<RentalRequest | undefined>()
    const [deleteRentalId, setDeleteRentalId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const availableCars = cars
        .filter((car) => car.status === 'available')
        .map((car) => ({
            id: car._id,
            label: `${car.make} ${car.carModel} (${car.licensePlate})`,
            dailyRate: car.dailyRate,
        }))

    const filteredRentals = rentals.filter((rental) => {
        const car = typeof rental.carId === 'object' ? rental.carId : cars.find((c) => c._id === rental.carId)
        const carName = car ? `${car.make} ${car.carModel}` : ''
        const customer = typeof rental.userId === 'object' ? rental.userId : null

        const matchesSearch =
            (customer?.username.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (customer?.email.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            carName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || rental.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const handleSave = async (rentalData: any) => {
        if (rentalData._id) {
            await onUpdateRental(rentalData)
        } else {
            await onAddRental(rentalData)
        }
        setEditingRental(undefined)
    }

    const handleEdit = (rental: RentalRequest) => {
        setEditingRental(rental)
        setIsDialogOpen(true)
    }

    const handleDelete = async () => {
        if (deleteRentalId) {
            await onDeleteRental(deleteRentalId)
            setDeleteRentalId(null)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'approved':
                return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'rejected':
                return 'bg-red-500/10 text-red-500 border-red-500/20'
            case 'completed':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            default:
                return ''
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    if (isLoading && rentals.length === 0) {
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
                    <h2>Rental Requests</h2>
                    <p className='text-muted-foreground'>{isAdmin ? 'Manage customer rental requests' : 'View your rental requests'}</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingRental(undefined)
                        setIsDialogOpen(true)
                    }}>
                    <Plus className='size-4 mr-2' />
                    New Request
                </Button>
            </div>

            <div className='flex flex-col sm:flex-row gap-4'>
                <div className='relative flex-1'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground' />
                    <Input
                        placeholder='Search by customer name, email, or car...'
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
                        <SelectItem value='pending'>Pending</SelectItem>
                        <SelectItem value='approved'>Approved</SelectItem>
                        <SelectItem value='rejected'>Rejected</SelectItem>
                        <SelectItem value='completed'>Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {filteredRentals.map((rental) => {
                    const car = typeof rental.carId === 'object' ? rental.carId : cars.find((c) => c._id === rental.carId)
                    return (
                        <Card key={rental._id} className='hover:border-primary/50 transition-colors'>
                            <CardHeader className='pb-3'>
                                <div className='flex items-start justify-between'>
                                    <div className='space-y-1'>
                                        <CardTitle>{typeof rental.userId === 'object' ? rental.userId.username : 'Unknown User'}</CardTitle>
                                        <CardDescription>{car ? `${car.make} ${car.carModel}` : 'Unknown Car'}</CardDescription>
                                    </div>
                                    {isAdmin && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant='ghost' size='sm'>
                                                    <MoreVertical className='size-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align='end'>
                                                <DropdownMenuItem onClick={() => handleEdit(rental)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setDeleteRentalId(rental._id)} className='text-destructive'>
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='flex items-center gap-2 text-muted-foreground'>
                                    <Mail className='size-4' />
                                    <span className='truncate'>{typeof rental.userId === 'object' ? rental.userId.email : 'No email'}</span>
                                </div>
                                <div className='flex items-center gap-2 text-muted-foreground'>
                                    <Phone className='size-4' />
                                    <span>{typeof rental.userId === 'object' ? rental.userId.phone || 'No phone' : 'No phone'}</span>
                                </div>
                                <div className='flex items-center gap-2 text-muted-foreground'>
                                    <Calendar className='size-4' />
                                    <span>
                                        {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                    </span>
                                </div>
                                <div className='flex items-center justify-between pt-2'>
                                    <Badge variant='outline' className={getStatusColor(rental.status)}>
                                        {rental.status}
                                    </Badge>
                                    <span>${rental.totalCost.toFixed(2)}</span>
                                </div>
                                {rental.notes && <p className='text-muted-foreground line-clamp-2 pt-2 border-t'>{rental.notes}</p>}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {filteredRentals.length === 0 && (
                <Card>
                    <CardContent className='flex flex-col items-center justify-center py-16'>
                        <p className='text-muted-foreground text-center'>
                            {searchQuery || statusFilter !== 'all'
                                ? 'No rental requests found matching your filters'
                                : "No rental requests yet. Click 'New Request' to get started."}
                        </p>
                    </CardContent>
                </Card>
            )}

            <RentalFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                rental={editingRental}
                onSave={handleSave}
                availableCars={availableCars}
                isAdmin={isAdmin}
                user={user}
            />

            <AlertDialog open={deleteRentalId !== null} onOpenChange={() => setDeleteRentalId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the rental request.</AlertDialogDescription>
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
