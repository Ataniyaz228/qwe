"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Github, Mail, Eye, EyeOff, Check, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { GuestRoute } from "@/components/auth/ProtectedRoute"
import { toast } from "sonner"

function RegisterPageContent() {
  const router = useRouter()
  const { register, isLoading: authLoading } = useAuth()
  const { t } = useLanguage()

  const passwordRequirements = [
    { label: t.settings.passwordRequirements.minLength, check: (p: string) => p.length >= 8 },
    { label: t.settings.passwordRequirements.uppercase, check: (p: string) => /[A-Z]/.test(p) },
    { label: t.settings.passwordRequirements.lowercase, check: (p: string) => /[a-z]/.test(p) },
    { label: t.settings.passwordRequirements.number, check: (p: string) => /[0-9]/.test(p) },
  ]

  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isPasswordValid = passwordRequirements.every(req => req.check(password))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const newErrors: Record<string, string> = {}

    if (!username || username.length < 3) {
      newErrors.username = t.common.error
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = t.common.error
    }
    if (!email || !email.includes("@")) {
      newErrors.email = t.common.error
    }
    if (!isPasswordValid) {
      newErrors.password = t.common.error
    }
    if (!agreedToTerms) {
      newErrors.terms = t.common.error
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await register(username, email, password)
      toast.success(t.auth.welcomeBack)
      router.push("/feed")
    } catch (err) {
      const message = err instanceof Error ? err.message : t.common.error
      try {
        const parsed = JSON.parse(message)
        const newErrors: Record<string, string> = {}
        if (parsed.username) newErrors.username = parsed.username[0]
        if (parsed.email) newErrors.email = parsed.email[0]
        if (parsed.password1) newErrors.password = parsed.password1[0]
        if (parsed.non_field_errors) newErrors.general = parsed.non_field_errors[0]
        setErrors(newErrors)
      } catch {
        setErrors({ general: t.common.error })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex flex-1 relative bg-secondary/30 border-r border-border overflow-hidden items-center justify-center">
        <Image src="/monkey-mascot.svg" alt="GitForum Mascot" fill className="object-cover" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <Image src="/gitforum-logo.svg" alt="GitForum" width={32} height={32} />
            <span className="text-lg font-semibold tracking-tight">GitForum</span>
          </Link>

          <h1 className="text-2xl font-bold mb-2">{t.auth.createAccount}</h1>
          <p className="text-muted-foreground mb-8">{t.auth.registerSubtitle}</p>

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

          {/* General error */}
          {errors.general && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t.auth.username}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  id="username"
                  type="text"
                  placeholder="devmaster"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`bg-secondary border-border pl-8 ${errors.username ? 'border-destructive' : ''}`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="dev@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`bg-secondary border-border ${errors.email ? 'border-destructive' : ''}`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-secondary border-border pr-10 ${errors.password ? 'border-destructive' : ''}`}
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
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}

              {/* Password Requirements */}
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req) => (
                    <div key={req.label} className="flex items-center gap-2 text-xs">
                      <div
                        className={`h-4 w-4 rounded-full flex items-center justify-center ${req.check(password) ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {req.check(password) && <Check className="h-3 w-3" />}
                      </div>
                      <span className={req.check(password) ? "text-green-500" : "text-muted-foreground"}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                className="mt-0.5"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              />
              <label
                htmlFor="terms"
                className={`text-sm leading-tight ${errors.terms ? 'text-destructive' : 'text-muted-foreground'}`}
              >
                {t.auth.termsAgree}{" "}
                <Link href="#" className="text-primary hover:underline">
                  {t.auth.termsOfService}
                </Link>{" "}
                {t.auth.and}{" "}
                <Link href="#" className="text-primary hover:underline">
                  {t.auth.privacyPolicy}
                </Link>
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.common.loading}
                </>
              ) : (
                t.auth.signUp
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.auth.hasAccount}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {t.auth.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// Обёртка для редиректа авторизованных пользователей
export default function RegisterPage() {
  return (
    <GuestRoute>
      <RegisterPageContent />
    </GuestRoute>
  )
}
