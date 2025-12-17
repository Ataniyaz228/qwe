"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Key, Shield, Download, Trash2, Eye, EyeOff, Loader2, Check, X, LogOut, Github, Link2, Unlink } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { authAPI, postsAPI } from "@/lib/api"
import { useRouter } from "next/navigation"

// Google icon component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

interface ConnectedAccount {
  provider: string
  email?: string
  name?: string
}

export function SettingsAccount() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load connected accounts
  useEffect(() => {
    loadConnectedAccounts()
  }, [])

  const loadConnectedAccounts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/users/oauth/connected/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setConnectedAccounts(data.connected_accounts || [])
      }
    } catch (err) {
      console.error('Failed to load connected accounts:', err)
    } finally {
      setLoadingAccounts(false)
    }
  }

  const disconnectAccount = async (provider: string) => {
    setDisconnecting(provider)
    try {
      const response = await fetch(`http://localhost:8000/api/users/oauth/connected/?provider=${provider}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(data.message || `${provider} отключен`)
        // Reload connected accounts
        await loadConnectedAccounts()
      } else {
        toast.error(data.error || 'Ошибка отключения')
      }
    } catch (err) {
      toast.error('Ошибка при отключении аккаунта')
    } finally {
      setDisconnecting(null)
    }
  }


  const passwordStrength = useMemo(() => {
    const password = passwords.new
    if (!password) return { score: 0, label: "", color: "" }

    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    if (score <= 1) return { score: 1, label: "Слабый", color: "bg-destructive" }
    if (score <= 2) return { score: 2, label: "Средний", color: "bg-orange-500" }
    if (score <= 3) return { score: 3, label: "Хороший", color: "bg-yellow-500" }
    if (score <= 4) return { score: 4, label: "Сильный", color: "bg-green-500" }
    return { score: 5, label: "Очень сильный", color: "bg-emerald-500" }
  }, [passwords.new])

  const passwordRequirements = useMemo(() => {
    const password = passwords.new
    return [
      { met: password.length >= 8, label: "Минимум 8 символов" },
      { met: /[A-Z]/.test(password), label: "Одна заглавная буква" },
      { met: /[a-z]/.test(password), label: "Одна строчная буква" },
      { met: /\d/.test(password), label: "Одна цифра" },
      { met: /[^a-zA-Z0-9]/.test(password), label: "Один спецсимвол" },
    ]
  }, [passwords.new])

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {}

    if (!passwords.current) {
      newErrors.current = "Введите текущий пароль"
    }
    if (!passwords.new) {
      newErrors.new = "Введите новый пароль"
    } else if (passwords.new.length < 8) {
      newErrors.new = "Пароль должен быть минимум 8 символов"
    }
    if (!passwords.confirm) {
      newErrors.confirm = "Подтвердите новый пароль"
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = "Пароли не совпадают"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) {
      toast.error("Исправьте ошибки перед сохранением")
      return
    }

    setSavingPassword(true)
    try {
      await authAPI.changePassword(passwords.current, passwords.new, passwords.confirm)
      setPasswords({ current: "", new: "", confirm: "" })
      toast.success("Пароль успешно изменён!")
    } catch (err) {
      toast.error("Ошибка при смене пароля. Проверьте текущий пароль.")
    } finally {
      setSavingPassword(false)
    }
  }

  const handleExportData = async () => {
    setExporting(true)
    try {
      // Получаем данные пользователя
      const bookmarks = await postsAPI.bookmarks()

      const userData = {
        profile: {
          username: user?.username,
          email: user?.email,
          displayName: user?.display_name,
          bio: user?.bio,
          website: user?.website,
          github: user?.github,
          location: user?.location,
          createdAt: user?.date_joined,
        },
        bookmarks: bookmarks.results?.map((b: any) => ({
          id: b.id,
          title: b.filename || b.title,
          language: b.language,
        })) || [],
        exportedAt: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `gitforum-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Данные экспортированы!")
    } catch (err) {
      toast.error("Ошибка при экспорте данных")
    } finally {
      setExporting(false)
    }
  }

  const handleLogoutAllDevices = async () => {
    setLoggingOut(true)
    try {
      await logout()
      router.push("/")
      toast.success("Вы вышли со всех устройств")
    } catch (err) {
      toast.error("Ошибка при выходе")
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Change Password */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Смена пароля</h3>
        </div>

        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Текущий пароль</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className={`bg-card border-border pr-10 ${errors.current ? "border-destructive" : ""}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.current && <p className="text-xs text-destructive">{errors.current}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Новый пароль</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className={`bg-card border-border pr-10 ${errors.new ? "border-destructive" : ""}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.new && <p className="text-xs text-destructive">{errors.new}</p>}

            {/* Password Strength Indicator */}
            {passwords.new && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{passwordStrength.label}</span>
                </div>
                <ul className="space-y-1">
                  {passwordRequirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      {req.met ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={req.met ? "text-green-500" : "text-muted-foreground"}>{req.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className={`bg-card border-border pr-10 ${errors.confirm ? "border-destructive" : ""}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
            {passwords.confirm && passwords.new === passwords.confirm && !errors.confirm && (
              <p className="text-xs text-green-500 flex items-center gap-1">
                <Check className="h-3 w-3" /> Пароли совпадают
              </p>
            )}
          </div>

          <Button onClick={handleUpdatePassword} disabled={savingPassword}>
            {savingPassword ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              "Сменить пароль"
            )}
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Двухфакторная аутентификация</h3>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card max-w-md">
          <p className="text-sm text-muted-foreground mb-4">
            Добавьте дополнительный уровень безопасности к вашему аккаунту.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              toast.info("2FA будет доступна в будущих обновлениях")
            }}
          >
            Включить 2FA
          </Button>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Привязанные аккаунты</h3>
        </div>

        <div className="space-y-3 max-w-md">
          {loadingAccounts ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Google */}
              <div className="p-4 rounded-lg border border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GoogleIcon className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Google</p>
                    {connectedAccounts.find(a => a.provider === 'google') ? (
                      <p className="text-xs text-muted-foreground">
                        {connectedAccounts.find(a => a.provider === 'google')?.email || 'Подключено'}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Не подключено</p>
                    )}
                  </div>
                </div>
                {connectedAccounts.find(a => a.provider === 'google') ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => disconnectAccount('google')}
                    disabled={disconnecting === 'google'}
                  >
                    {disconnecting === 'google' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Unlink className="h-4 w-4 mr-1" />
                        Отключить
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = 'http://localhost:8000/accounts/google/login/'}
                  >
                    Подключить
                  </Button>
                )}
              </div>

              {/* GitHub */}
              <div className="p-4 rounded-lg border border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Github className="h-5 w-5" />
                  <div>
                    <p className="font-medium">GitHub</p>
                    {connectedAccounts.find(a => a.provider === 'github') ? (
                      <p className="text-xs text-muted-foreground">
                        {connectedAccounts.find(a => a.provider === 'github')?.name || 'Подключено'}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Не подключено</p>
                    )}
                  </div>
                </div>
                {connectedAccounts.find(a => a.provider === 'github') ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => disconnectAccount('github')}
                    disabled={disconnecting === 'github'}
                  >
                    {disconnecting === 'github' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Unlink className="h-4 w-4 mr-1" />
                        Отключить
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = 'http://localhost:8000/accounts/github/login/'}
                  >
                    Подключить
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>


      {/* Sessions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <LogOut className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Сессии</h3>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card max-w-md">
          <p className="text-sm text-muted-foreground mb-4">
            Выйти из аккаунта на всех устройствах.
          </p>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleLogoutAllDevices}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Выйти со всех устройств
          </Button>
        </div>
      </div>

      {/* Export Data */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Download className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Экспорт данных</h3>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card max-w-md">
          <p className="text-sm text-muted-foreground mb-4">
            Скачайте копию ваших данных: профиль, закладки и посты.
          </p>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExportData} disabled={exporting}>
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Экспортируем...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Экспорт данных
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="h-5 w-5 text-destructive" />
          <h3 className="font-semibold text-destructive">Опасная зона</h3>
        </div>

        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/5 max-w-md">
          <h4 className="font-medium text-destructive mb-2">Удаление аккаунта</h4>
          <p className="text-sm text-muted-foreground mb-4">
            После удаления аккаунта все ваши данные будут безвозвратно удалены.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Удалить аккаунт
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие нельзя отменить. Все ваши данные, посты и закладки будут удалены навсегда.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    toast.info("Удаление аккаунта будет доступно в будущих обновлениях")
                  }}
                >
                  Удалить аккаунт
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div >
  )
}
