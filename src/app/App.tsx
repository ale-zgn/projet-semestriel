import { LoginForm } from './components/LoginForm'
import { Dashboard } from './components/Dashboard'
import { useAuth } from './hooks/useAuth'

export default function App() {
    const { user, isAuthenticated, isLoading: authLoading, login, register, logout } = useAuth()

    if (authLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-background'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
                    <p className='mt-4 text-muted-foreground'>Loading...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <LoginForm onLogin={login} onRegister={register} isLoading={authLoading} />
    }

    return <Dashboard user={user} logout={logout} />
}
