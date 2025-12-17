"use client"

import { Suspense, useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

function OAuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { setTokensAndLoad } = useAuth()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('Авторизация...')
    const hasProcessed = useRef(false)

    useEffect(() => {
        // Prevent multiple executions
        if (hasProcessed.current) return
        hasProcessed.current = true

        const handleCallback = async () => {
            const access = searchParams.get('access')
            const refresh = searchParams.get('refresh')
            const provider = searchParams.get('provider')
            const error = searchParams.get('error')

            if (error) {
                setStatus('error')
                setMessage('Ошибка авторизации: ' + error)
                setTimeout(() => router.push('/login'), 3000)
                return
            }

            if (access && refresh) {
                try {
                    // Сохраняем токены и загружаем пользователя
                    await setTokensAndLoad(access, refresh)

                    setStatus('success')
                    setMessage(`Успешный вход через ${provider || 'OAuth'}!`)
                    toast.success('Добро пожаловать!')

                    // Редирект на feed
                    setTimeout(() => router.push('/feed'), 1500)
                } catch (err) {
                    console.error('Error setting tokens:', err)
                    setStatus('error')
                    setMessage('Ошибка сохранения токенов')
                    setTimeout(() => router.push('/login'), 3000)
                }
            } else {
                setStatus('error')
                setMessage('Токены не получены')
                setTimeout(() => router.push('/login'), 3000)
            }
        }

        handleCallback()
    }, [searchParams, router, setTokensAndLoad])

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center p-8">
                {status === 'loading' && (
                    <>
                        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Авторизация...</h1>
                        <p className="text-muted-foreground">Пожалуйста, подождите</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">{message}</h1>
                        <p className="text-muted-foreground">Перенаправление...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Ошибка</h1>
                        <p className="text-muted-foreground">{message}</p>
                    </>
                )}
            </div>
        </div>
    )
}

export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        }>
            <OAuthCallbackContent />
        </Suspense>
    )
}

