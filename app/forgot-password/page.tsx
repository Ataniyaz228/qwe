"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react"
import { GuestRoute } from "@/components/auth/ProtectedRoute"

function ForgotPasswordContent() {
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!email || !email.includes("@")) {
            setError("Введите корректный email")
            return
        }

        setIsSubmitting(true)
        try {
            // API вызов для сброса пароля
            const response = await fetch("http://localhost:8000/api/auth/password/reset/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.detail || "Ошибка отправки")
            }

            setIsSuccess(true)
        } catch (err) {
            // Показываем успех даже при ошибке (для безопасности)
            setIsSuccess(true)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8">
                        <Image src="/gitforum-logo.png" alt="GitForum" width={32} height={32} />
                        <span className="text-lg font-semibold tracking-tight">GitForum</span>
                    </Link>

                    {isSuccess ? (
                        // Успешная отправка
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-500/10 mb-6">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Проверьте почту</h1>
                            <p className="text-muted-foreground mb-8">
                                Если аккаунт с email <strong>{email}</strong> существует,
                                мы отправили инструкции по сбросу пароля.
                            </p>
                            <Link href="/login">
                                <Button className="w-full">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Вернуться ко входу
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        // Форма
                        <>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Назад ко входу
                            </Link>

                            <h1 className="text-2xl font-bold mb-2">Забыли пароль?</h1>
                            <p className="text-muted-foreground mb-8">
                                Введите email, указанный при регистрации. Мы отправим ссылку для сброса пароля.
                            </p>

                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="dev@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="bg-secondary border-border pl-10"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Отправка...
                                        </>
                                    ) : (
                                        "Отправить ссылку"
                                    )}
                                </Button>
                            </form>

                            <p className="mt-6 text-center text-sm text-muted-foreground">
                                Вспомнили пароль?{" "}
                                <Link href="/login" className="text-primary hover:underline">
                                    Войти
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Right Panel - Visual */}
            <div className="hidden lg:flex flex-1 relative bg-secondary/30 border-l border-border overflow-hidden items-center justify-center">
                <Image src="/monkey-mascot.svg" alt="GitForum Mascot" fill className="object-cover" />
            </div>
        </div>
    )
}

export default function ForgotPasswordPage() {
    return (
        <GuestRoute>
            <ForgotPasswordContent />
        </GuestRoute>
    )
}
