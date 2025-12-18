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
import { useLanguage } from "@/contexts/LanguageContext"

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
  const { t } = useLanguage()
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
        toast.success(data.message || `${provider} ${t.settingsPage.disconnected}`)
        await loadConnectedAccounts()
      } else {
        toast.error(data.error || t.settingsPage.disconnectError)
      }
    } catch (err) {
      toast.error(t.settingsPage.disconnectAccountError)
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

    if (score <= 1) return { score: 1, label: t.settingsPage.weak, color: "bg-red-500" }
    if (score <= 2) return { score: 2, label: t.settingsPage.medium, color: "bg-orange-500" }
    if (score <= 3) return { score: 3, label: t.settingsPage.good, color: "bg-yellow-500" }
    if (score <= 4) return { score: 4, label: t.settingsPage.strong, color: "bg-green-500" }
    return { score: 5, label: t.settingsPage.veryStrong, color: "bg-emerald-500" }
  }, [passwords.new])

  const passwordRequirements = useMemo(() => {
    const password = passwords.new
    return [
      { met: password.length >= 8, label: t.settingsPage.min8chars },
      { met: /[A-Z]/.test(password), label: t.settingsPage.uppercase },
      { met: /[a-z]/.test(password), label: t.settingsPage.lowercase },
      { met: /\d/.test(password), label: t.settingsPage.digit },
      { met: /[^a-zA-Z0-9]/.test(password), label: t.settingsPage.special },
    ]
  }, [passwords.new])

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {}

    if (!passwords.current) newErrors.current = t.settingsPage.enterCurrentPassword
    if (!passwords.new) newErrors.new = t.settingsPage.enterNewPassword
    else if (passwords.new.length < 8) newErrors.new = t.settingsPage.minChars
    if (!passwords.confirm) newErrors.confirm = t.settingsPage.confirmPasswordRequired
    else if (passwords.new !== passwords.confirm) newErrors.confirm = t.settingsPage.passwordsDontMatch

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) {
      toast.error(t.settingsPage.fixErrors)
      return
    }

    setSavingPassword(true)
    try {
      await authAPI.changePassword(passwords.current, passwords.new, passwords.confirm)
      setPasswords({ current: "", new: "", confirm: "" })
      toast.success(t.settingsPage.passwordChanged)
    } catch (err) {
      toast.error(t.settingsPage.checkCurrentPassword)
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

      toast.success(t.settingsPage.dataExported)
    } catch (err) {
      toast.error(t.settingsPage.exportError)
    } finally {
      setExporting(false)
    }
  }

  const handleLogoutAllDevices = async () => {
    setLoggingOut(true)
    try {
      await logout()
      router.push("/")
      toast.success(t.settingsPage.loggedOutAll)
    } catch (err) {
      toast.error(t.settingsPage.logoutError)
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
            <h3 className="text-sm font-medium text-white/70">{t.settingsPage.changePassword}</h3>
            <p className="text-[11px] text-white/30">{t.settingsPage.updateAccountPassword}</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <PasswordInput
            id="currentPassword"
            label={t.settingsPage.currentPassword}
            value={passwords.current}
            onChange={(v) => setPasswords({ ...passwords, current: v })}
            show={showCurrentPassword}
            onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
            error={errors.current}
          />

          <PasswordInput
            id="newPassword"
            label={t.settingsPage.newPassword}
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
            label={t.settingsPage.confirmPassword}
            value={passwords.confirm}
            onChange={(v) => setPasswords({ ...passwords, confirm: v })}
            show={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirm}
          />
          {passwords.confirm && passwords.new === passwords.confirm && !errors.confirm && (
            <p className="text-[10px] text-green-400 flex items-center gap-1"><Check className="h-3 w-3" strokeWidth={2} /> {t.settingsPage.passwordsMatch}</p>
          )}

          <Button
            className="gap-2 bg-white text-black hover:bg-white/90 rounded-xl h-10 font-medium"
            onClick={handleUpdatePassword}
            disabled={savingPassword}
          >
            {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" strokeWidth={2} />}
            {savingPassword ? t.settingsPage.saving : t.settingsPage.changePasswordBtn}
          </Button>
        </div>
      </div>

      {/* 2FA */}
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-white/50" strokeWidth={1.5} />
          <div>
            <h3 className="text-sm font-medium text-white/70">{t.settingsPage.twoFactor}</h3>
            <p className="text-[11px] text-white/30">{t.settingsPage.additionalSecurity}</p>
          </div>
        </div>
        <p className="text-xs text-white/35 mb-3">{t.settingsPage.twoFactorDesc}</p>
        <Button
          variant="outline"
          className="gap-2 bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05] hover:text-white/80 rounded-xl"
          onClick={() => toast.info(t.settingsPage.twoFactorFuture)}
        >
          <Shield className="h-4 w-4" strokeWidth={1.5} />
          {t.settingsPage.enable2FA}
        </Button>
      </div>

      {/* Connected Accounts */}
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="h-4 w-4 text-white/50" strokeWidth={1.5} />
          <div>
            <h3 className="text-sm font-medium text-white/70">{t.settingsPage.connectedAccounts}</h3>
            <p className="text-[11px] text-white/30">{t.settingsPage.oauthProviders}</p>
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
                    {connectedAccounts.find(a => a.provider === 'google')?.email || t.settingsPage.notConnected}
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
                  {t.settingsPage.disconnect}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05] rounded-lg"
                  onClick={() => window.location.href = 'http://localhost:8000/accounts/google/login/'}
                >
                  {t.settingsPage.connect}
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
                    {connectedAccounts.find(a => a.provider === 'github')?.name || t.settingsPage.notConnected}
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
                  {t.settingsPage.disconnect}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05] rounded-lg"
                  onClick={() => window.location.href = 'http://localhost:8000/accounts/github/login/'}
                >
                  {t.settingsPage.connect}
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
            <h3 className="text-sm font-medium text-white/70">{t.settingsPage.sessions}</h3>
            <p className="text-[11px] text-white/30">{t.settingsPage.sessionManagement}</p>
          </div>
        </div>
        <p className="text-xs text-white/35 mb-3">{t.settingsPage.logoutAllDesc}</p>
        <Button
          variant="outline"
          className="gap-2 bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05] hover:text-white/80 rounded-xl"
          onClick={handleLogoutAllDevices}
          disabled={loggingOut}
        >
          {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" strokeWidth={1.5} />}
          {t.settingsPage.logoutAllDevices}
        </Button>
      </div>

      {/* Export */}
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-2 mb-3">
          <Download className="h-4 w-4 text-white/50" strokeWidth={1.5} />
          <div>
            <h3 className="text-sm font-medium text-white/70">{t.settingsPage.exportData}</h3>
            <p className="text-[11px] text-white/30">{t.settingsPage.downloadDataCopy}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2 bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05] hover:text-white/80 rounded-xl"
          onClick={handleExportData}
          disabled={exporting}
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" strokeWidth={1.5} />}
          {exporting ? t.settingsPage.exporting : t.settingsPage.exportDataBtn}
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4 p-5 rounded-xl bg-red-500/5 border border-red-500/20">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-red-400" strokeWidth={1.5} />
          <div>
            <h3 className="text-sm font-medium text-red-400">{t.settingsPage.dangerZone}</h3>
            <p className="text-[11px] text-red-400/50">{t.settingsPage.irreversibleActions}</p>
          </div>
        </div>
        <p className="text-xs text-white/35 mb-3">{t.settingsPage.deleteAccountWarning}</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2 rounded-xl">
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              {t.settingsPage.deleteAccount}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#0c0c0e] border-white/[0.06]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white/90">{t.settingsPage.areYouSure}</AlertDialogTitle>
              <AlertDialogDescription className="text-white/40">
                {t.settingsPage.deleteConfirmation}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/[0.04] border-white/[0.06] text-white/60 hover:bg-white/[0.08]">{t.settingsPage.cancel}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={() => toast.info(t.settingsPage.deleteFuture)}
              >
                {t.settingsPage.deleteAccount}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
