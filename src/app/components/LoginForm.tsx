import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Car, Loader2 } from 'lucide-react'

interface LoginFormProps {
    onLogin: (email: string, password: string) => Promise<boolean>
    onRegister: (username: string, email: string, password: string) => Promise<boolean>
    isLoading?: boolean
}

export function LoginForm({ onLogin, onRegister, isLoading = false }: LoginFormProps) {
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [registerUsername, setRegisterUsername] = useState('')
    const [registerEmail, setRegisterEmail] = useState('')
    const [registerPassword, setRegisterPassword] = useState('')

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (loginEmail && loginPassword) {
            await onLogin(loginEmail, loginPassword)
        }
    }

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (registerUsername && registerEmail && registerPassword) {
            await onRegister(registerUsername, registerEmail, registerPassword)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-background p-4'>
            <Card className='w-full max-w-md'>
                <CardHeader className='space-y-1 text-center'>
                    <div className='flex justify-center mb-4'>
                        <div className='p-3 bg-primary rounded-lg'>
                            <Car className='size-8 text-primary-foreground' />
                        </div>
                    </div>
                    <CardTitle>Car Rental Manager</CardTitle>
                    <CardDescription>Sign in to manage your fleet and rentals</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='login' className='w-full'>
                        <TabsList className='grid w-full grid-cols-2'>
                            <TabsTrigger value='login'>Login</TabsTrigger>
                            <TabsTrigger value='register'>Register</TabsTrigger>
                        </TabsList>

                        <TabsContent value='login'>
                            <form onSubmit={handleLoginSubmit} className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='login-email'>Email</Label>
                                    <Input
                                        id='login-email'
                                        type='email'
                                        placeholder='Enter your email'
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='login-password'>Password</Label>
                                    <Input
                                        id='login-password'
                                        type='password'
                                        placeholder='Enter your password'
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type='submit' className='w-full' disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className='size-4 mr-2 animate-spin' />
                                            Signing in...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value='register'>
                            <form onSubmit={handleRegisterSubmit} className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='register-username'>Username</Label>
                                    <Input
                                        id='register-username'
                                        type='text'
                                        placeholder='Choose a username'
                                        value={registerUsername}
                                        onChange={(e) => setRegisterUsername(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='register-email'>Email</Label>
                                    <Input
                                        id='register-email'
                                        type='email'
                                        placeholder='Enter your email'
                                        value={registerEmail}
                                        onChange={(e) => setRegisterEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='register-password'>Password</Label>
                                    <Input
                                        id='register-password'
                                        type='password'
                                        placeholder='Choose a password (min 6 characters)'
                                        value={registerPassword}
                                        onChange={(e) => setRegisterPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type='submit' className='w-full' disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className='size-4 mr-2 animate-spin' />
                                            Creating account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
