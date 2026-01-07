import { LoginForm } from './components/LoginForm'
import { Dashboard } from './components/Dashboard'
import { useAuth } from './hooks/useAuth'
import { Toaster } from 'sonner'

export default function App() {
    const { user, isAuthenticated, isLoading: authLoading, login, register, logout } = useAuth()

    if (authLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-background'>
                <Toaster position='top-right' />
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
                    <p className='mt-4 text-muted-foreground'>Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <Toaster position='top-right' />
            {!isAuthenticated ? <LoginForm onLogin={login} onRegister={register} isLoading={authLoading} /> : <Dashboard user={user} logout={logout} />}
        </>
    )
}
