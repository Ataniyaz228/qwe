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
import { Key, Shield, Download, Trash2, Eye, EyeOff, Loader2, Check, X, LogOut, Github, Link2, Unlink, Lock, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { authAPI, postsAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

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

    if (score <= 1) return { score: 1, label: "Слабый", color: "bg-red-500" }
    if (score <= 2) return { score: 2, label: "Средний", color: "bg-orange-500" }
    if (score <= 3) return { score: 3, label: "Хороший", color: "bg-yellow-500" }
    if (score <= 4) return { score: 4, label: "Сильный", color: "bg-green-500" }
    return { score: 5, label: "Очень сильный", color: "bg-emerald-500" }
  }, [passwords.new])

  const passwordRequirements = useMemo(() => {
    const password = passwords.new
    return [
      { met: password.length >= 8, label: "Минимум 8 символов" },
      { met: /[A-Z]/.test(password), label: "Заглавная буква" },
      { met: /[a-z]/.test(password), label: "Строчная буква" },
      { met: /\d/.test(password), label: "Цифра" },
      { met: /[^a-zA-Z0-9]/.test(password), label: "Спецсимвол" },
    ]
  }, [passwords.new])

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {}

    if (!passwords.current) newErrors.current = "Введите текущий пароль"
    if (!passwords.new) newErrors.new = "Введите новый пароль"
    else if (passwords.new.length < 8) newErrors.new = "Минимум 8 символов"
    if (!passwords.confirm) newErrors.confirm = "Подтвердите пароль"
    else if (passwords.new !== passwords.confirm) newErrors.confirm = "Пароли не совпадают"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) {
      toast.error("Исправьте ошибки")
      return
    }

    setSavingPassword(true)
    try {
      await authAPI.changePassword(passwords.current, passwords.new, passwords.confirm)
      setPasswords({ current: "", new: "", confirm: "" })
      toast.success("Пароль изменён!")
    } catch (err) {
      toast.error("Проверьте текущий пароль")
    } finally {
      setSavingPassword(false)
    }
  }

  const handleExportData = async () => {
    setExporting(true)
    try {
      const bookmarks = await postsAPI.bookmarks()
      const userData = {
        profile: {
          username: user?.username,
          email: user?.email,
          displayName: user?.display_name,
          bio: user?.bio,
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
      toast.error("Ошибка экспорта")
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

  const PasswordInput = ({
    id, label, value, onChange, show, onToggle, error
  }: {
    id: string; label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; error?: string
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs text-white/50">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-10 pr-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.12] focus-visible:ring-0 rounded-xl",
            error && "border-red-500/50"
          )}
        />
        <button
          type="button"
          className="absolute right-0 top-0 h-full px-3 text-white/30 hover:text-white/60 transition-colors"
          onClick={onToggle}
        >
          {show ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-2 mb-3">
          <Key className="h-4 w-4 text-white/50" strokeWidth={1.5} />
          <div>
            <h3 className="text-sm font-medium text-white/70">Смена пароля</h3>
            <p className="text-[11px] text-white/30">Обновите пароль аккаунта</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <PasswordInput
            id="currentPassword"
            label="Текущий пароль"
            value={passwords.current}
            onChange={(v) => setPasswords({ ...passwords, current: v })}
            show={showCurrentPassword}
            onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
            error={errors.current}
          />

          <PasswordInput
            id="newPassword"
            label="Новый пароль"
            value={passwords.new}
            onChange={(v) => setPasswords({ ...passwords, new: v })}
            show={showNewPassword}
            onToggle={() => setShowNewPassword(!showNewPassword)}
            error={errors.new}
          />

          {passwords.new && (
            <div className="space-y-3 p-3 rounded-lg bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all", passwordStrength.color)} style={{ width: `${(passwordStrength.score / 5) * 100}%` }} />
                </div>
                <span className="text-[10px] text-white/40">{passwordStrength.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {passwordRequirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px]">
                    {req.met ? <Check className="h-3 w-3 text-green-400" strokeWidth={2} /> : <X className="h-3 w-3 text-white/20" strokeWidth={2} />}
                    <span className={req.met ? "text-green-400" : "text-white/25"}>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <PasswordInput
            id="confirmPassword"
            label="Подтвердите пароль"
            value={passwords.confirm}
            onChange={(v) => setPasswords({ ...passwords, confirm: v })}
            show={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirm}
          />
          {passwords.confirm && passwords.new === passwords.confirm && !errors.confirm && (
            <p className="text-[10px] text-green-400 flex items-center gap-1"><Check className="h-3 w-3" strokeWidth={2} /> Пароли совпадают</p>
          )}

          <Button
            className="gap-2 bg-white text-black hover:bg-white/90 rounded-xl h-10 font-medium"
            onClick={handleUpdatePassword}
            disabled={savingPassword}
          >
            {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" strokeWidth={2} />}
            {savingPassword ? "Сохранение..." : "Сменить пароль"}
          </Button>
        </div>
      </div>

      {/* 2FA */}
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-white/50" strokeWidth={1.5} />
          <div>
            <h3 className="text-sm font-medium text-white/70">Двухфакторная аутентификация</h3>
            <p className="text-[11px] text-white/30">Дополнительная защита</p>
          </div>
        </div>
        <p className="text-xs text-white/35 mb-3">Добавьте дополнительный уровень безопасности.</p>
        <Button
          variant="outline"
          className="gap-2 bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05] hover:text-white/80 rounded-xl"
          onClick={() => toast.info("2FA будет доступна в будущих обновлениях")}
        >
          <Shield className="h-4 w-4" strokeWidth={1.5} />
          Включить 2FA
        </Button>
      </div>

      {/* Connected Accounts */}
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="h-4 w-4 text-white/50" strokeWidth={1.5} />
          <div>
            <h3 className="text-sm font-medium text-white/70">Привязанные аккаунты</h3>
            <p className="text-[11px] text-white/30">OAuth провайдеры</p>
          </div>
        </div>

        {loadingAccounts ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-white/30" />
          </div>
        ) : (
          <div className="space-y-2">
            {/* Google */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] transition-all hover:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <GoogleIcon className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium text-white/70">Google</p>
                  <p className="text-[10px] text-white/30">
                    {connectedAccounts.find(a => a.provider === 'google')?.email || 'Не подключено'}
                  </p>
                </div>
              </div>
              {connectedAccounts.find(a => a.provider === 'google') ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-400 rounded-lg"
                  onClick={() => disconnectAccount('google')}
                  disabled={disconnecting === 'google'}
                >
                  {disconnecting === 'google' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unlink className="h-3 w-3" strokeWidth={1.5} />}
                  Отключить
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05] rounded-lg"
                  onClick={() => window.location.href = 'http://localhost:8000/accounts/google/login/'}
                >
                  Подключить
                </Button>
              )}
            </div>

            {/* GitHub */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] transition-all hover:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <Github className="h-5 w-5 text-white/70" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-white/70">GitHub</p>
                  <p className="text-[10px] text-white/30">
                    {connectedAccounts.find(a => a.provider === 'github')?.name || 'Не подключено'}
                  </p>
                </div>
              </div>
              {connectedAccounts.find(a => a.provider === 'github') ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-400 rounded-lg"
                  onClick={() => disconnectAccount('github')}
                  disabled={disconnecting === 'github'}
                >
                  {disconnecting === 'github' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unlink className="h-3 w-3" strokeWidth={1.5} />}
                  Отключить
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05] rounded-lg"
                  onClick={() => window.location.href = 'http://localhost:8000/accounts/github/login/'}
                >
                  Подключить
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sessions */}
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-2 mb-3">
          <LogOut className="h-4 w-4 text-white/50" strokeWidth={1.5} />
          <div>
            <h3 className="text-sm font-medium text-white/70">Сессии</h3>
            <p className="text-[11px] text-white/30">Управление входом</p>
          </div>
        </div>
        <p className="text-xs text-white/35 mb-3">Выйти из аккаунта на всех устройствах.</p>
        <Button
          variant="outline"
          className="gap-2 bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05] hover:text-white/80 rounded-xl"
          onClick={handleLogoutAllDevices}
          disabled={loggingOut}
        >
          {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" strokeWidth={1.5} />}
          Выйти со всех устройств
        </Button>
      </div>

      {/* Export */}
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-2 mb-3">
          <Download className="h-4 w-4 text-white/50" strokeWidth={1.5} />
          <div>
            <h3 className="text-sm font-medium text-white/70">Экспорт данных</h3>
            <p className="text-[11px] text-white/30">Скачайте копию данных</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2 bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05] hover:text-white/80 rounded-xl"
          onClick={handleExportData}
          disabled={exporting}
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" strokeWidth={1.5} />}
          {exporting ? "Экспортируем..." : "Экспорт данных"}
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4 p-5 rounded-xl bg-red-500/5 border border-red-500/20">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-red-400" strokeWidth={1.5} />
          <div>
            <h3 className="text-sm font-medium text-red-400">Опасная зона</h3>
            <p className="text-[11px] text-red-400/50">Необратимые действия</p>
          </div>
        </div>
        <p className="text-xs text-white/35 mb-3">После удаления аккаунта все данные будут удалены безвозвратно.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2 rounded-xl">
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              Удалить аккаунт
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#0c0c0e] border-white/[0.06]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white/90">Вы уверены?</AlertDialogTitle>
              <AlertDialogDescription className="text-white/40">
                Это действие нельзя отменить. Все данные будут удалены навсегда.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/[0.04] border-white/[0.06] text-white/60 hover:bg-white/[0.08]">Отмена</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={() => toast.info("Удаление аккаунта будет доступно в будущих обновлениях")}
              >
                Удалить аккаунт
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
