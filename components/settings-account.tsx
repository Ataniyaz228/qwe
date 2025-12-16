"use client"

import { useState, useMemo } from "react"
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
import { Key, Shield, Download, Trash2, Eye, EyeOff, Loader2, Check, X, LogOut } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { authAPI, postsAPI } from "@/lib/api"
import { useRouter } from "next/navigation"

export function SettingsAccount() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    </div>
  )
}
