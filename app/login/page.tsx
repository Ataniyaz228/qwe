"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Github, Eye, EyeOff, Loader2, Code, Sparkles, Rocket, Lightbulb, Zap } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { GuestRoute } from "@/components/auth/ProtectedRoute"
import { toast } from "sonner"

// Google icon SVG
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function LoginPageContent() {
  const router = useRouter()
  const { login } = useAuth()
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
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-cyan-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="max-w-md text-center">
            {/* Floating Icons Animation */}
            <div className="relative mb-8">
              <div className="absolute -top-4 -left-4 animate-pulse">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Code className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="absolute -top-8 right-8 animate-pulse delay-300">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="h-32 w-32 mx-auto rounded-3xl bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center shadow-2xl shadow-primary/30">
                <Image src="/gitforum-logo.svg" alt="GitForum" width={64} height={64} className="h-16 w-16" />
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Добро пожаловать в GitForum
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Платформа для разработчиков, где код становится искусством. Делитесь сниппетами, учитесь у лучших.
            </p>

            {/* Animated Code Snippets */}
            <div className="mt-8 space-y-3 text-left">
              <div className="p-4 rounded-xl bg-[#0d1117] border border-white/10 font-mono text-sm">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground text-xs">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span>snippet.ts</span>
                </div>
                <div><span className="text-blue-400">const</span> <span className="text-yellow-300">useAwesome</span> = () =&gt; {"{"}</div>
                <div className="pl-4"><span className="text-gray-500">// Your code here</span></div>
                <div className="pl-4"><span className="text-blue-400">return</span> <span className="text-green-400">&apos;amazing&apos;</span></div>
                <div>{"}"}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#0d1117] border border-white/10 font-mono text-xs opacity-80">
                <div className="flex items-center gap-2 text-green-400">
                  <span>$</span>
                  <span>git push origin main</span>
                  <span className="animate-pulse">_</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 p-4 rounded-xl bg-gradient-to-br from-primary/20 to-sky-500/10 border border-primary/20 text-center hover:border-primary/40 transition-colors">
                  <Rocket className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-xs text-muted-foreground">Быстрый старт</div>
                </div>
                <div className="flex-1 p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/20 text-center hover:border-yellow-500/40 transition-colors">
                  <Lightbulb className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                  <div className="text-xs text-muted-foreground">Умные теги</div>
                </div>
                <div className="flex-1 p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20 text-center hover:border-green-500/40 transition-colors">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="text-xs text-muted-foreground">Мгновенно</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-card/50">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <Image src="/gitforum-logo.svg" alt="GitForum" width={32} height={32} />
            <span className="text-lg font-semibold tracking-tight">GitForum</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t.auth.welcomeBack}</h1>
            <p className="text-muted-foreground">{t.auth.loginSubtitle}</p>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant="outline"
              className="gap-2 h-11 bg-card hover:bg-secondary border-border transition-all hover:scale-[1.02]"
              disabled={isSubmitting}
              onClick={() => window.location.href = 'http://localhost:8000/accounts/google/login/'}
            >
              <GoogleIcon className="h-5 w-5" />
              <span>Google</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2 h-11 bg-card hover:bg-secondary border-border transition-all hover:scale-[1.02]"
              disabled={isSubmitting}
              onClick={() => window.location.href = 'http://localhost:8000/accounts/github/login/'}
            >
              <Github className="h-5 w-5" />
              <span>GitHub</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card/50 backdrop-blur-sm px-3 text-muted-foreground">
                или
              </span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-shake">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="dev@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">{t.auth.password}</Label>
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
                  className="h-11 bg-background border-border pr-10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-primary to-sky-500 hover:from-primary/90 hover:to-sky-500/90 transition-all hover:scale-[1.02] shadow-lg shadow-primary/25"
              disabled={isSubmitting}
            >
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

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t.auth.noAccount}{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              {t.auth.signUp}
            </Link>
          </p>
        </div>
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
