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
import { Github, Eye, EyeOff, Check, Loader2, Users, Zap, Shield } from "lucide-react"
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

function RegisterPageContent() {
    const router = useRouter()
    const { register } = useAuth()
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
    const [selectedLang, setSelectedLang] = useState<string>('python')

    // Code examples for different languages
    const codeExamples: Record<string, { file: string; code: React.ReactNode }> = {
        javascript: {
            file: 'hello.js',
            code: (
                <>
                    <div><span className="text-blue-400">const</span> <span className="text-yellow-300">welcome</span> = <span className="text-purple-400">(user)</span> <span className="text-blue-400">=&gt;</span> {"{"}  </div>
                    <div className="pl-4"><span className="text-blue-400">return</span> <span className="text-green-400">`Hello, ${"{"}user${"}"}`</span></div>
                    <div>{"}"}  </div>
                </>
            )
        },
        typescript: {
            file: 'hello.ts',
            code: (
                <>
                    <div><span className="text-blue-400">const</span> <span className="text-yellow-300">welcome</span> = <span className="text-purple-400">(user: <span className="text-cyan-400">string</span>)</span>: <span className="text-cyan-400">string</span> <span className="text-blue-400">=&gt;</span> {"{"}  </div>
                    <div className="pl-4"><span className="text-blue-400">return</span> <span className="text-green-400">`Hello, ${"{"}user${"}"}`</span></div>
                    <div>{"}"}  </div>
                </>
            )
        },
        python: {
            file: 'hello.py',
            code: (
                <>
                    <div><span className="text-purple-400">def</span> <span className="text-yellow-300">welcome</span><span className="text-blue-400">(</span>user<span className="text-blue-400">)</span>:</div>
                    <div className="pl-4"><span className="text-blue-400">return</span> <span className="text-green-400">f"Hello, {"{"}user{"}"}"</span></div>
                </>
            )
        },
        rust: {
            file: 'hello.rs',
            code: (
                <>
                    <div><span className="text-purple-400">fn</span> <span className="text-yellow-300">welcome</span>(user: <span className="text-cyan-400">&amp;str</span>) -&gt; <span className="text-cyan-400">String</span> {"{"}  </div>
                    <div className="pl-4"><span className="text-purple-400">format!</span>(<span className="text-green-400">"Hello, {"{"}{"}"}", user</span>)</div>
                    <div>{"}"}  </div>
                </>
            )
        },
        go: {
            file: 'hello.go',
            code: (
                <>
                    <div><span className="text-purple-400">func</span> <span className="text-yellow-300">welcome</span>(user <span className="text-cyan-400">string</span>) <span className="text-cyan-400">string</span> {"{"}  </div>
                    <div className="pl-4"><span className="text-blue-400">return</span> <span className="text-purple-400">fmt.Sprintf</span>(<span className="text-green-400">"Hello, %s", user</span>)</div>
                    <div>{"}"}  </div>
                </>
            )
        },
    }

    const languages = [
        { id: 'javascript', name: 'JavaScript', color: 'yellow' },
        { id: 'typescript', name: 'TypeScript', color: 'blue' },
        { id: 'python', name: 'Python', color: 'green' },
        { id: 'rust', name: 'Rust', color: 'orange' },
        { id: 'go', name: 'Go', color: 'cyan' },
    ]

    const isPasswordValid = passwordRequirements.every(req => req.check(password))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        const newErrors: Record<string, string> = {}

        if (!username || username.length < 3) {
            newErrors.username = "Минимум 3 символа"
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            newErrors.username = "Только буквы, цифры и _"
        }
        if (!email || !email.includes("@")) {
            newErrors.email = "Некорректный email"
        }
        if (!isPasswordValid) {
            newErrors.password = "Пароль не соответствует требованиям"
        }
        if (!agreedToTerms) {
            newErrors.terms = "Необходимо принять условия"
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
            {/* Left Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-card/50">
                <div className="w-full max-w-md animate-fade-in">
                    {/* Mobile Logo */}
                    <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
                        <Image src="/gitforum-logo.svg" alt="GitForum" width={32} height={32} />
                        <span className="text-lg font-semibold tracking-tight">GitForum</span>
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">{t.auth.createAccount}</h1>
                        <p className="text-muted-foreground">{t.auth.registerSubtitle}</p>
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

                    {/* General error */}
                    {errors.general && (
                        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-shake">
                            {errors.general}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-medium">{t.auth.username}</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="devmaster"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`h-11 bg-background border-border pl-8 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.username ? 'border-destructive' : ''}`}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.username && (
                                <p className="text-xs text-destructive">{errors.username}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">{t.auth.email}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="dev@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`h-11 bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.email ? 'border-destructive' : ''}`}
                                disabled={isSubmitting}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">{t.auth.password}</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`h-11 bg-background border-border pr-10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${errors.password ? 'border-destructive' : ''}`}
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
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    {passwordRequirements.map((req) => (
                                        <div key={req.label} className="flex items-center gap-2 text-xs">
                                            <div
                                                className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${req.check(password) ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
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
                                t.auth.signUp
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        {t.auth.hasAccount}{" "}
                        <Link href="/login" className="text-primary font-medium hover:underline">
                            {t.auth.signIn}
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Panel - Decorative */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-bl from-cyan-500/20 via-purple-500/10 to-primary/20" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-sky-400/30 via-transparent to-transparent" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
                    <div className="max-w-md text-center">
                        {/* Floating Icons */}
                        <div className="relative mb-8">
                            <div className="absolute -top-4 -right-4 animate-pulse">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                                    <Users className="h-7 w-7 text-white" />
                                </div>
                            </div>
                            <div className="absolute -bottom-4 left-4 animate-pulse delay-500">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                                    <Shield className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="h-28 w-28 mx-auto rounded-3xl bg-gradient-to-br from-sky-400 to-primary flex items-center justify-center shadow-2xl shadow-sky-500/30">
                                <Zap className="h-14 w-14 text-white" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            Начните делиться кодом
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                            Создайте аккаунт за минуту и присоединяйтесь к сообществу
                        </p>

                        {/* Interactive Code Preview */}
                        <div className="space-y-3 text-left">
                            <div className="p-4 rounded-xl bg-[#0d1117] border border-white/10 font-mono text-sm transition-all">
                                <div className="flex items-center gap-2 mb-3 text-muted-foreground text-xs">
                                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span>{codeExamples[selectedLang]?.file}</span>
                                </div>
                                {codeExamples[selectedLang]?.code}
                            </div>

                            <div className="p-3 rounded-xl bg-[#0d1117] border border-white/10 font-mono text-xs opacity-80">
                                <div className="flex items-center gap-2 text-green-400">
                                    <span>$</span>
                                    <span>npm create gitforum-app</span>
                                    <span className="animate-pulse">_</span>
                                </div>
                            </div>

                            {/* Programming Languages - Clickable */}
                            <div className="flex flex-wrap gap-2 justify-center pt-2">
                                <button
                                    onClick={() => setSelectedLang('javascript')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer
                    ${selectedLang === 'javascript'
                                            ? 'bg-yellow-500/30 border-2 border-yellow-400 text-yellow-300 scale-105'
                                            : 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:scale-105'
                                        }`}
                                >
                                    JavaScript
                                </button>
                                <button
                                    onClick={() => setSelectedLang('typescript')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer
                    ${selectedLang === 'typescript'
                                            ? 'bg-blue-500/30 border-2 border-blue-400 text-blue-300 scale-105'
                                            : 'bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:scale-105'
                                        }`}
                                >
                                    TypeScript
                                </button>
                                <button
                                    onClick={() => setSelectedLang('python')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer
                    ${selectedLang === 'python'
                                            ? 'bg-green-500/30 border-2 border-green-400 text-green-300 scale-105'
                                            : 'bg-green-500/20 border border-green-500/30 text-green-400 hover:scale-105'
                                        }`}
                                >
                                    Python
                                </button>
                                <button
                                    onClick={() => setSelectedLang('rust')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer
                    ${selectedLang === 'rust'
                                            ? 'bg-orange-500/30 border-2 border-orange-400 text-orange-300 scale-105'
                                            : 'bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:scale-105'
                                        }`}
                                >
                                    Rust
                                </button>
                                <button
                                    onClick={() => setSelectedLang('go')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer
                    ${selectedLang === 'go'
                                            ? 'bg-cyan-500/30 border-2 border-cyan-400 text-cyan-300 scale-105'
                                            : 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:scale-105'
                                        }`}
                                >
                                    Go
                                </button>
                                <div className="px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-medium">+40</div>
                            </div>
                        </div>
                    </div>
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
