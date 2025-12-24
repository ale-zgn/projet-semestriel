import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Search, Loader2, User as UserIcon, Mail, Calendar } from 'lucide-react'
import { User } from '../../services/api'

interface UsersTabProps {
    users: User[]
    isLoading: boolean
}

export function UsersTab({ users, isLoading }: UsersTabProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredUsers = users.filter(
        (user) => user.username.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    if (isLoading) {
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
                    <h2>Users Management</h2>
                    <p className='text-muted-foreground'>View and manage registered users</p>
                </div>
            </div>

            <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground' />
                <Input
                    placeholder='Search by username or email...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10 max-w-md'
                />
            </div>

            <Card>
                <CardHeader className='pb-3'>
                    <CardTitle>Registered Users</CardTitle>
                    <CardDescription>Total users: {filteredUsers.length}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='rounded-md border'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Rentals</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className='text-center py-8 text-muted-foreground'>
                                            No users found matching your search
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className='flex flex-col'>
                                                    <div className='flex items-center gap-2 font-medium'>
                                                        <UserIcon className='size-3 text-muted-foreground' />
                                                        {user.username}
                                                    </div>
                                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                                        <Mail className='size-3' />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant='outline'>{user.rentalCount || 0}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex items-center gap-2 text-muted-foreground'>
                                                    <Calendar className='size-3' />
                                                    {/* Note: User interface in api.ts doesn't have createdAt yet, need to check */}
                                                    {formatDate((user as any).createdAt)}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
