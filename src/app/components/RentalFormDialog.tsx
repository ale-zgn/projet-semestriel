import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { RentalRequest, User as UserType } from '../../services/api'
import { toast } from 'sonner'
import { User } from 'lucide-react'

interface RentalFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    rental?: RentalRequest
    onSave: (rental: any) => void
    availableCars: { id: string; label: string; dailyRate: number }[]
    isAdmin: boolean
    user: UserType | null
}

export function RentalFormDialog({ open, onOpenChange, rental, onSave, availableCars, isAdmin, user }: RentalFormDialogProps) {
    const [formData, setFormData] = useState<Partial<RentalRequest>>({
        carId: '',
        startDate: '',
        endDate: '',
        status: 'pending',
        notes: '',
        totalCost: 0,
    })

    useEffect(() => {
        if (rental) {
            setFormData({
                carId: typeof rental.carId === 'object' ? rental.carId._id : rental.carId,
                startDate: rental.startDate ? new Date(rental.startDate).toISOString().split('T')[0] : '',
                endDate: rental.endDate ? new Date(rental.endDate).toISOString().split('T')[0] : '',
                status: rental.status,
                notes: rental.notes,
                totalCost: rental.totalCost,
            })
        } else {
            setFormData({
                carId: '',
                startDate: '',
                endDate: '',
                status: 'pending',
                notes: '',
                totalCost: 0,
            })
        }
    }, [rental, open, isAdmin, user])

    // Auto-calculate total cost when dates or car changes
    useEffect(() => {
        if (formData.startDate && formData.endDate && formData.carId) {
            const start = new Date(formData.startDate)
            const end = new Date(formData.endDate)
            const car = availableCars.find((c) => c.id === formData.carId)

            if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && car) {
                const diffTime = Math.abs(end.getTime() - start.getTime())
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                const days = diffDays === 0 ? 1 : diffDays + 1

                if (days > 0) {
                    setFormData((prev) => ({ ...prev, totalCost: days * car.dailyRate }))
                }
            }
        }
    }, [formData.startDate, formData.endDate, formData.carId, availableCars])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const start = new Date(formData.startDate!)
        const end = new Date(formData.endDate!)

        if (start < today) {
            toast.error('Start date cannot be in the past')
            return
        }

        if (end < start) {
            toast.error('End date must be after start date')
            return
        }

        onSave({ ...formData, ...(rental?._id ? { _id: rental._id } : {}) })
        onOpenChange(false)
    }

    const displayedUser = rental && typeof rental.userId === 'object' ? rental.userId : user

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>{rental ? 'Edit Rental Request' : 'New Rental Request'}</DialogTitle>
                    <DialogDescription>{rental ? 'Update the rental details below' : 'Fill in the rental request details'}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className='grid gap-4 py-4'>
                        <div className='bg-muted/50 p-4 rounded-lg space-y-2 mb-2 border border-border/50'>
                            <p className='text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2'>
                                <User className='size-3' />
                                Customer Information
                            </p>
                            <div className='grid sm:grid-cols-2 gap-x-8 gap-y-1'>
                                <div className='flex items-center gap-2 text-sm'>
                                    <span className='font-semibold'>Name:</span>
                                    <span>{displayedUser?.username || 'Guest'}</span>
                                </div>
                                <div className='flex items-center gap-2 text-sm'>
                                    <span className='font-semibold'>Email:</span>
                                    <span>{displayedUser?.email || '-'}</span>
                                </div>
                                <div className='flex items-center gap-2 text-sm'>
                                    <span className='font-semibold'>Phone:</span>
                                    <span>{displayedUser?.phone || '-'}</span>
                                </div>
                                <div className='flex items-center gap-2 text-sm text-primary/70'>
                                    <span className='font-semibold'>Account:</span>
                                    <span className='capitalize font-medium'>{displayedUser?.role || 'User'}</span>
                                </div>
                            </div>
                        </div>

                        <div className='grid md:grid-cols-2 gap-4'>
                            <div className='grid gap-2'>
                                <Label htmlFor='carId'>Select Car</Label>
                                <Select
                                    value={formData.carId as string}
                                    onValueChange={(value) => {
                                        setFormData({
                                            ...formData,
                                            carId: value,
                                        })
                                    }}>
                                    <SelectTrigger id='carId'>
                                        <SelectValue placeholder='Choose a car' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCars.map((car) => (
                                            <SelectItem key={car.id} value={car.id}>
                                                {car.label} - ${car.dailyRate}/day
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='grid gap-2'>
                                <Label htmlFor='totalCost'>Total Cost ($)</Label>
                                <Input
                                    id='totalCost'
                                    type='number'
                                    step='0.01'
                                    value={formData.totalCost}
                                    readOnly
                                    className='bg-muted font-mono font-medium'
                                />
                            </div>
                        </div>

                        <div className='grid md:grid-cols-2 gap-4'>
                            <div className='grid gap-2'>
                                <Label htmlFor='startDate'>Start Date</Label>
                                <Input
                                    id='startDate'
                                    type='date'
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className='grid gap-2'>
                                <Label htmlFor='endDate'>End Date</Label>
                                <Input
                                    id='endDate'
                                    type='date'
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className='grid gap-4'>
                            {isAdmin && (
                                <div className='grid gap-2'>
                                    <Label htmlFor='status'>Status</Label>
                                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                                        <SelectTrigger id='status'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='pending'>Pending</SelectItem>
                                            <SelectItem value='approved'>Approved</SelectItem>
                                            <SelectItem value='rejected'>Rejected</SelectItem>
                                            <SelectItem value='completed'>Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className='grid gap-2'>
                                <Label htmlFor='notes'>Notes</Label>
                                <Textarea
                                    id='notes'
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder='Additional notes about this rental...'
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type='submit' className='min-w-[120px]'>
                            {rental ? 'Update' : 'Create'} Request
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
