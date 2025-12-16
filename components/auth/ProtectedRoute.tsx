"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
    children: React.ReactNode
    redirectTo?: string
}

/**
 * Компонент для защиты маршрутов, требующих авторизации
 */
export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push(redirectTo)
        }
    }, [isAuthenticated, isLoading, router, redirectTo])

    // Показываем лоадер пока проверяем авторизацию
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Загрузка...</p>
                </div>
            </div>
        )
    }

    // Если не авторизован - ничего не показываем (будет редирект)
    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}

interface GuestRouteProps {
    children: React.ReactNode
    redirectTo?: string
}

/**
 * Компонент для страниц, доступных только неавторизованным пользователям
 * (например, логин и регистрация)
 */
export function GuestRoute({ children, redirectTo = '/feed' }: GuestRouteProps) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push(redirectTo)
        }
    }, [isAuthenticated, isLoading, router, redirectTo])

    // Показываем лоадер пока проверяем авторизацию
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Загрузка...</p>
                </div>
            </div>
        )
    }

    // Если авторизован - ничего не показываем (будет редирект)
    if (isAuthenticated) {
        return null
    }

    return <>{children}</>
}
