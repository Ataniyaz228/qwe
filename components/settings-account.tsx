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
import { useToast } from "@/hooks/use-toast"
import { Key, Shield, Download, Trash2, Eye, EyeOff, Loader2, Check, X } from "lucide-react"

export function SettingsAccount() {
  const { toast } = useToast()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [exporting, setExporting] = useState(false)
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

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-destructive" }
    if (score <= 2) return { score: 2, label: "Fair", color: "bg-orange-500" }
    if (score <= 3) return { score: 3, label: "Good", color: "bg-yellow-500" }
    if (score <= 4) return { score: 4, label: "Strong", color: "bg-green-500" }
    return { score: 5, label: "Very Strong", color: "bg-emerald-500" }
  }, [passwords.new])

  const passwordRequirements = useMemo(() => {
    const password = passwords.new
    return [
      { met: password.length >= 8, label: "At least 8 characters" },
      { met: /[A-Z]/.test(password), label: "One uppercase letter" },
      { met: /[a-z]/.test(password), label: "One lowercase letter" },
      { met: /\d/.test(password), label: "One number" },
      { met: /[^a-zA-Z0-9]/.test(password), label: "One special character" },
    ]
  }, [passwords.new])

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {}

    if (!passwords.current) {
      newErrors.current = "Current password is required"
    }
    if (!passwords.new) {
      newErrors.new = "New password is required"
    } else if (passwords.new.length < 8) {
      newErrors.new = "Password must be at least 8 characters"
    }
    if (!passwords.confirm) {
      newErrors.confirm = "Please confirm your new password"
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      })
      return
    }

    setSavingPassword(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSavingPassword(false)

    setPasswords({ current: "", new: "", confirm: "" })
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    })
  }

  const handleExportData = async () => {
    setExporting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const userData = {
      profile: {
        displayName: "Alex Developer",
        username: "alexdev",
        email: "alex@example.com",
        bio: "Full-stack developer passionate about clean code and open source.",
        createdAt: "2024-01-15",
      },
      snippets: [
        { id: 1, title: "React useDebounce Hook", language: "TypeScript", stars: 234 },
        { id: 2, title: "CSS Grid Layout", language: "CSS", stars: 156 },
        { id: 3, title: "Express Middleware", language: "JavaScript", stars: 89 },
      ],
      bookmarks: [
        { id: 4, title: "Rust Error Handling", author: "rustacean" },
        { id: 5, title: "Python Decorators", author: "pythonista" },
      ],
      followers: 1234,
      following: 567,
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

    setExporting(false)
    toast({
      title: "Export complete",
      description: "Your data has been downloaded successfully.",
    })
  }

  return (
    <div className="space-y-8">
      {/* Change Password */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Change Password</h3>
        </div>

        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
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
            <Label htmlFor="newPassword">New Password</Label>
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
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
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
                <Check className="h-3 w-3" /> Passwords match
              </p>
            )}
          </div>

          <Button onClick={handleUpdatePassword} disabled={savingPassword}>
            {savingPassword ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Two-Factor Authentication</h3>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card max-w-md">
          <p className="text-sm text-muted-foreground mb-4">
            Add an extra layer of security to your account by enabling two-factor authentication.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: "2FA Setup",
                description: "Two-factor authentication setup will be available soon.",
              })
            }}
          >
            Enable 2FA
          </Button>
        </div>
      </div>

      {/* Export Data */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Download className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Export Data</h3>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card max-w-md">
          <p className="text-sm text-muted-foreground mb-4">
            Download a copy of your data including your snippets, bookmarks, and profile information.
          </p>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExportData} disabled={exporting}>
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export All Data
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="h-5 w-5 text-destructive" />
          <h3 className="font-semibold text-destructive">Danger Zone</h3>
        </div>

        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/5 max-w-md">
          <h4 className="font-medium text-destructive mb-2">Delete Account</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. All your snippets, bookmarks, and data will be
            permanently removed.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove all your data from
                  our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    toast({
                      title: "Account deletion",
                      description: "Account deletion requires backend implementation.",
                      variant: "destructive",
                    })
                  }}
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
