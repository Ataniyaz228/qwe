"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Github, Mail, Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { GuestRoute } from "@/components/auth/ProtectedRoute"
import { toast } from "sonner"

function LoginPageContent() {
  const router = useRouter()
  const { login, isLoading: authLoading } = useAuth()
  const { t } = useLanguage()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError(t.auth.email + " и " + t.auth.password + " обязательны")
      return
    }

    setIsSubmitting(true)
    try {
      await login(email, password)
      toast.success(t.auth.welcomeBack)
      router.push("/feed")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка входа"
      try {
        const parsed = JSON.parse(message)
        if (parsed.non_field_errors) {
          setError(parsed.non_field_errors[0])
        } else if (parsed.detail) {
          setError(parsed.detail)
        } else {
          setError(t.common.error)
        }
      } catch {
        setError(t.common.error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md animate-fade-in">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <Image src="/gitforum-logo.svg" alt="GitForum" width={32} height={32} />
            <span className="text-lg font-semibold tracking-tight">GitForum</span>
          </Link>

          <h1 className="text-2xl font-bold mb-2">{t.auth.welcomeBack}</h1>
          <p className="text-muted-foreground mb-8">{t.auth.loginSubtitle}</p>

          {/* OAuth Buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <Button
              variant="outline"
              className="gap-2 w-full bg-secondary/50 border-border hover:bg-secondary"
              disabled={isSubmitting}
            >
              <Github className="h-4 w-4" />
              {t.auth.orContinueWith} GitHub
            </Button>
            <Button
              variant="outline"
              className="gap-2 w-full bg-secondary/50 border-border hover:bg-secondary"
              disabled={isSubmitting}
            >
              <Mail className="h-4 w-4" />
              {t.auth.orContinueWith} Google
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t.auth.orContinueWith} Email
              </span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="dev@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary border-border"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t.auth.password}</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  {t.auth.forgotPassword}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary border-border pr-10"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t.auth.rememberMe}
              </label>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.common.loading}
                </>
              ) : (
                t.auth.signIn
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.auth.noAccount}{" "}
            <Link href="/register" className="text-primary hover:underline">
              {t.auth.signUp}
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-secondary/30 border-l border-border overflow-hidden items-center justify-center">
        <Image src="/monkey-mascot.svg" alt="GitForum Mascot" fill className="object-cover" />
      </div>
    </div>
  )
}

// Обёртка для редиректа авторизованных пользователей
export default function LoginPage() {
  return (
    <GuestRoute>
      <LoginPageContent />
    </GuestRoute>
  )
}
