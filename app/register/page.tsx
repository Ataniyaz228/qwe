"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Github, Eye, EyeOff, Check, Loader2, User, Mail, Lock, ArrowLeft, Rocket, Code, Users, Sparkles, FileCode, Globe } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { GuestRoute } from "@/components/auth/ProtectedRoute"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Google icon SVG
function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    )
}

function RegisterPageContent() {
    const router = useRouter()
    const { register } = useAuth()
    const { t, language, setLanguage } = useLanguage()
    const [mounted, setMounted] = useState(false)
    const [activeStep, setActiveStep] = useState(0)

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
    const [focusedField, setFocusedField] = useState<string | null>(null)

    useEffect(() => {
        setMounted(true)
        const interval = setInterval(() => {
            setActiveStep(prev => (prev + 1) % 3)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const isPasswordValid = passwordRequirements.every(req => req.check(password))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        const newErrors: Record<string, string> = {}
        if (!username || username.length < 3) newErrors.username = t.validation.minChars
        if (!/^[a-zA-Z0-9_]+$/.test(username)) newErrors.username = t.validation.onlyLatinAndUnderscore
        if (!email || !email.includes("@")) newErrors.email = t.validation.invalidEmail
        if (!isPasswordValid) newErrors.password = t.validation.passwordNotMeet
        if (!agreedToTerms) newErrors.terms = t.validation.acceptTerms

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setIsSubmitting(true)
        try {
            await register(username, email, password)
            toast.success(t.validation.accountCreated)
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

    const steps = [
        { icon: User, title: t.badges.createProfile, desc: t.badges.chooseUsername },
        { icon: Code, title: t.badges.shareCode, desc: t.badges.publishSnippets },
        { icon: Users, title: t.badges.communicate, desc: t.badges.findLikeminded },
    ]

    const codeLines = [
        { num: 1, code: 'const user = await createUser({' },
        { num: 2, code: '  username: "developer",' },
        { num: 3, code: '  email: "dev@example.com",' },
        { num: 4, code: '  plan: "free"' },
        { num: 5, code: '})' },
        { num: 6, code: '' },
        { num: 7, code: 'await sendWelcomeEmail(user)' },
    ]

    return (
        <div className="min-h-screen bg-[#09090b] flex flex-col">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-white/[0.01] rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            {/* Header */}
            <header className={cn(
                "relative z-10 flex items-center justify-between p-6 transition-all duration-700",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            )}>
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] group-hover:bg-white/[0.05] transition-all">
                        <ArrowLeft className="h-4 w-4 text-white/40 group-hover:text-white/70 transition-colors" strokeWidth={1.5} />
                    </div>
                    <Image src="/gitforum-logo.png" alt="GitForum" width={32} height={32} className="h-8 w-8" />
                    <span className="text-base font-medium text-white/70">GitForum</span>
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setLanguage(language === 'ru' ? 'kk' : 'ru')}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/50 hover:text-white/90 transition-colors rounded-lg hover:bg-white/[0.04]"
                    >
                        <Globe className="h-4 w-4" strokeWidth={1.5} />
                        <span className="uppercase text-xs font-medium">{language}</span>
                    </button>
                    <Link href="/login">
                        <Button variant="ghost" size="sm" className="text-white/50 hover:text-white/80 hover:bg-white/[0.04]">
                            {t.badges.haveAccount}
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-5xl relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left - Register Form */}
                    <div className={cn(
                        "w-full max-w-sm mx-auto lg:mx-0 transition-all duration-700 delay-100",
                        mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                    )}>
                        {/* Heading */}
                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] mb-4">
                                <Rocket className="h-3 w-3 text-white/40" strokeWidth={1.5} />
                                <span className="text-xs text-white/40">{t.badges.freeRegistration}</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white/90 mb-2">{t.auth.createAccount}</h1>
                            <p className="text-sm text-white/40">{t.auth.registerSubtitle}</p>
                        </div>

                        {/* Form card */}
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                            {/* OAuth */}
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <Button
                                    variant="outline"
                                    className="h-10 bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] text-white/60 text-sm transition-all"
                                    disabled={isSubmitting}
                                    onClick={() => window.location.href = 'http://localhost:8000/accounts/google/login/'}
                                >
                                    <GoogleIcon className="h-4 w-4 mr-2 text-white/40" />
                                    Google
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-10 bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] text-white/60 text-sm transition-all"
                                    disabled={isSubmitting}
                                    onClick={() => window.location.href = 'http://localhost:8000/accounts/github/login/'}
                                >
                                    <Github className="h-4 w-4 mr-2 text-white/40" strokeWidth={1.5} />
                                    GitHub
                                </Button>
                            </div>

                            {/* Divider */}
                            <div className="relative my-5">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/[0.06]" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-[#0c0c0e] px-3 text-[10px] text-white/25 uppercase tracking-wider">{t.auth.orContinueWith}</span>
                                </div>
                            </div>

                            {/* Error */}
                            {errors.general && (
                                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {errors.general}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {/* Username */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="username" className="text-xs text-white/50">{t.auth.username}</Label>
                                    <div className={cn(
                                        "relative rounded-lg transition-all duration-200",
                                        focusedField === 'username' && "ring-1 ring-white/[0.12]"
                                    )}>
                                        <User className={cn(
                                            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                                            focusedField === 'username' ? "text-white/50" : "text-white/20"
                                        )} strokeWidth={1.5} />
                                        <Input
                                            id="username"
                                            placeholder="developer"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            onFocus={() => setFocusedField('username')}
                                            onBlur={() => setFocusedField(null)}
                                            className="h-10 pl-10 bg-white/[0.02] border-white/[0.06] text-white placeholder:text-white/20 focus:border-white/[0.1] focus-visible:ring-0"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    {errors.username && <p className="text-xs text-red-400">{errors.username}</p>}
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs text-white/50">{t.auth.email}</Label>
                                    <div className={cn(
                                        "relative rounded-lg transition-all duration-200",
                                        focusedField === 'email' && "ring-1 ring-white/[0.12]"
                                    )}>
                                        <Mail className={cn(
                                            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                                            focusedField === 'email' ? "text-white/50" : "text-white/20"
                                        )} strokeWidth={1.5} />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="dev@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            className="h-10 pl-10 bg-white/[0.02] border-white/[0.06] text-white placeholder:text-white/20 focus:border-white/[0.1] focus-visible:ring-0"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-xs text-white/50">{t.auth.password}</Label>
                                    <div className={cn(
                                        "relative rounded-lg transition-all duration-200",
                                        focusedField === 'password' && "ring-1 ring-white/[0.12]"
                                    )}>
                                        <Lock className={cn(
                                            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                                            focusedField === 'password' ? "text-white/50" : "text-white/20"
                                        )} strokeWidth={1.5} />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            className="h-10 pl-10 pr-10 bg-white/[0.02] border-white/[0.06] text-white placeholder:text-white/20 focus:border-white/[0.1] focus-visible:ring-0"
                                            disabled={isSubmitting}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-white/25 hover:text-white/50"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                                        </Button>
                                    </div>
                                    {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                                </div>

                                {/* Password requirements */}
                                {password && (
                                    <div className="grid grid-cols-2 gap-1.5 py-2">
                                        {passwordRequirements.map((req, i) => (
                                            <div key={i} className="flex items-center gap-1.5">
                                                <div className={cn(
                                                    "h-3.5 w-3.5 rounded-full flex items-center justify-center transition-colors",
                                                    req.check(password) ? "bg-green-500/20" : "bg-white/[0.03]"
                                                )}>
                                                    <Check className={cn(
                                                        "h-2 w-2 transition-colors",
                                                        req.check(password) ? "text-green-500" : "text-white/20"
                                                    )} strokeWidth={2} />
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] transition-colors",
                                                    req.check(password) ? "text-white/50" : "text-white/25"
                                                )}>{req.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Terms */}
                                <div className="flex items-start gap-2 py-1">
                                    <Checkbox
                                        id="terms"
                                        checked={agreedToTerms}
                                        onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                                        className="border-white/15 data-[state=checked]:bg-white data-[state=checked]:text-black h-3.5 w-3.5 mt-0.5"
                                    />
                                    <label htmlFor="terms" className="text-[11px] text-white/35 cursor-pointer leading-relaxed">
                                        {t.auth.termsAgree}{" "}
                                        <Link href="/terms" className="text-white/50 hover:text-white/70 transition-colors">{t.auth.termsOfService}</Link>
                                        {" "}{t.auth.and}{" "}
                                        <Link href="/privacy" className="text-white/50 hover:text-white/70 transition-colors">{t.auth.privacyPolicy}</Link>
                                    </label>
                                </div>
                                {errors.terms && <p className="text-xs text-red-400">{errors.terms}</p>}

                                <Button
                                    type="submit"
                                    className="w-full h-10 bg-white text-black hover:bg-white/90 font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.common.loading}</> : t.auth.signUp}
                                </Button>
                            </form>
                        </div>

                        <p className="mt-6 text-center text-sm text-white/30">
                            {t.auth.hasAccount}{" "}
                            <Link href="/login" className="text-white/60 hover:text-white transition-colors">{t.auth.signIn}</Link>
                        </p>
                    </div>

                    {/* Right - Animated Preview */}
                    <div className={cn(
                        "hidden lg:block transition-all duration-700 delay-300",
                        mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                    )}>
                        <div className="relative">
                            {/* Glow */}
                            <div className="absolute -inset-4 bg-white/[0.02] rounded-3xl blur-2xl" />

                            {/* Code window */}
                            <div className="relative rounded-2xl border border-white/[0.06] bg-[#0c0c0e] overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.04]">
                                    <div className="flex gap-1.5">
                                        <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                                        <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                                        <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03]">
                                        <FileCode className="h-3 w-3 text-white/30" strokeWidth={1.5} />
                                        <span className="text-[11px] text-white/40 font-mono">register.ts</span>
                                    </div>
                                    <div className="w-12" />
                                </div>

                                {/* Code */}
                                <div className="p-5 font-mono text-sm">
                                    {codeLines.map((line, i) => (
                                        <div key={line.num} className="flex">
                                            <span className="w-6 text-white/15 select-none text-right mr-4">{line.num}</span>
                                            <span className="text-white/40">{line.code}</span>
                                        </div>
                                    ))}
                                    <div className="flex mt-1">
                                        <span className="w-6 text-white/15 select-none text-right mr-4">8</span>
                                        <span className="h-4 w-0.5 bg-white/40 animate-pulse" />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-t border-white/[0.04] text-[10px] text-white/25">
                                    <span className="flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500/60 animate-pulse" />
                                        {t.badges.ready}
                                    </span>
                                    <span>TypeScript</span>
                                </div>
                            </div>

                            {/* Steps */}
                            <div className="mt-6 space-y-3">
                                {steps.map((step, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-500",
                                            activeStep === i
                                                ? "bg-white/[0.04] border-white/[0.1]"
                                                : "bg-white/[0.02] border-white/[0.04]"
                                        )}
                                        style={{ transitionDelay: `${400 + i * 100}ms` }}
                                    >
                                        <div className={cn(
                                            "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
                                            activeStep === i ? "bg-white/[0.08]" : "bg-white/[0.04]"
                                        )}>
                                            <step.icon className={cn(
                                                "h-4 w-4 transition-colors",
                                                activeStep === i ? "text-white/60" : "text-white/30"
                                            )} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className={cn(
                                                "text-sm font-medium transition-colors",
                                                activeStep === i ? "text-white/80" : "text-white/50"
                                            )}>{step.title}</p>
                                            <p className="text-[11px] text-white/30">{step.desc}</p>
                                        </div>
                                        <div className={cn(
                                            "ml-auto h-5 w-5 rounded-full flex items-center justify-center transition-all",
                                            activeStep === i ? "bg-white/10" : "bg-transparent"
                                        )}>
                                            <Check className={cn(
                                                "h-3 w-3 transition-all",
                                                activeStep === i ? "text-white/50 scale-100" : "text-transparent scale-0"
                                            )} strokeWidth={2} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <GuestRoute>
            <RegisterPageContent />
        </GuestRoute>
    )
}
