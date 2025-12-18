"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Github, Globe, Save, Loader2, MapPin, User, AtSign, Mail } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { usersAPI } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"

export function SettingsProfile() {
    const { user, refreshUser } = useAuth()
    const { t } = useLanguage()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [profile, setProfile] = useState({
        display_name: "",
        username: "",
        email: "",
        bio: "",
        website: "",
        github: "",
        location: "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (user) {
            setProfile({
                display_name: user.display_name || "",
                username: user.username || "",
                email: user.email || "",
                bio: user.bio || "",
                website: user.website || "",
                github: user.github_username || "",
                location: user.location || "",
            })
            setLoading(false)
        }
    }, [user])

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(t.settingsPage.fileTooLarge)
                return
            }
            if (!file.type.startsWith("image/")) {
                toast.error(t.settingsPage.selectImage)
                return
            }

            const reader = new FileReader()
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)

            try {
                toast.loading(t.settingsPage.uploadingAvatar)
                await usersAPI.uploadAvatar(file)
                toast.dismiss()
                toast.success(t.settingsPage.avatarUpdated)

                if (refreshUser) {
                    await refreshUser()
                }
            } catch (err) {
                console.error("Avatar upload error:", err)
                toast.dismiss()
                toast.error(err instanceof Error ? err.message : t.settingsPage.avatarUploadError)
                setAvatarPreview(null)
            }
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!profile.display_name.trim()) {
            newErrors.display_name = t.settingsPage.nameRequired
        }
        if (profile.bio.length > 160) {
            newErrors.bio = t.settingsPage.bioMaxLength
        }
        if (profile.website && !/^https?:\/\/.+/.test(profile.website)) {
            newErrors.website = t.settingsPage.urlFormat
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) {
            toast.error(t.settingsPage.fixErrorsBeforeSave)
            return
        }

        if (!user) return

        setSaving(true)
        try {
            await usersAPI.updateProfile(user.username, {
                display_name: profile.display_name,
                bio: profile.bio,
                website: profile.website,
                github_username: profile.github,
                location: profile.location,
            })

            if (refreshUser) {
                await refreshUser()
            }

            toast.success(t.settingsPage.profileSaved)
        } catch (err) {
            console.error("Error saving profile:", err)
            toast.error(t.settingsPage.profileSaveError)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-white/30" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="relative group">
                    <Avatar className="h-20 w-20 border-2 border-white/[0.08] transition-all group-hover:border-white/[0.15]">
                        <AvatarImage src={avatarPreview || user?.avatar || "/developer-avatar.png"} />
                        <AvatarFallback className="bg-white/[0.04] text-white/40 text-xl">
                            {profile.display_name?.[0] || profile.username?.[0] || "?"}
                        </AvatarFallback>
                    </Avatar>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />
                    <Button
                        size="icon"
                        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white text-black hover:bg-white/90 transition-all"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Camera className="h-4 w-4" strokeWidth={2} />
                    </Button>
                </div>
                <div>
                    <h3 className="font-medium text-white/80 mb-1">{t.settingsPage.profilePhoto}</h3>
                    <p className="text-xs text-white/35">{t.settingsPage.photoFormats}</p>
                    {avatarPreview && (
                        <button
                            className="mt-2 text-xs text-white/40 hover:text-white/70 transition-colors"
                            onClick={() => setAvatarPreview(null)}
                        >
                            {t.settingsPage.cancelUpload}
                        </button>
                    )}
                </div>
            </div>

            {/* Form Fields */}
            <div className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="display_name" className="text-xs text-white/50 flex items-center gap-2">
                            <User className="h-3 w-3" strokeWidth={1.5} />
                            {t.settingsPage.displayName}
                        </Label>
                        <Input
                            id="display_name"
                            value={profile.display_name}
                            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                            className={cn(
                                "h-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.12] focus-visible:ring-0 rounded-xl",
                                errors.display_name && "border-red-500/50"
                            )}
                        />
                        {errors.display_name && <p className="text-xs text-red-400">{errors.display_name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-xs text-white/50 flex items-center gap-2">
                            <AtSign className="h-3 w-3" strokeWidth={1.5} />
                            {t.settingsPage.username}
                        </Label>
                        <Input
                            id="username"
                            value={profile.username}
                            disabled
                            className="h-10 bg-white/[0.02] border-white/[0.04] text-white/40 rounded-xl opacity-60"
                        />
                        <p className="text-[10px] text-white/25">{t.settingsPage.cannotChange}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs text-white/50 flex items-center gap-2">
                        <Mail className="h-3 w-3" strokeWidth={1.5} />
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="h-10 bg-white/[0.02] border-white/[0.04] text-white/40 rounded-xl opacity-60"
                    />
                    <p className="text-[10px] text-white/25">{t.settingsPage.cannotChange}</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio" className="text-xs text-white/50">{t.settingsPage.aboutMe}</Label>
                    <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className={cn(
                            "bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.12] focus-visible:ring-0 rounded-xl min-h-[100px] resize-none",
                            errors.bio && "border-red-500/50"
                        )}
                        placeholder={t.settingsPage.tellAboutYourself}
                    />
                    <div className="flex justify-between">
                        <p className={cn(
                            "text-[10px]",
                            profile.bio.length > 160 ? "text-red-400" : "text-white/25"
                        )}>
                            {profile.bio.length}/160
                        </p>
                        {errors.bio && <p className="text-xs text-red-400">{errors.bio}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location" className="text-xs text-white/50 flex items-center gap-2">
                        <MapPin className="h-3 w-3" strokeWidth={1.5} />
                        {t.settingsPage.location}
                    </Label>
                    <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="h-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.12] focus-visible:ring-0 rounded-xl"
                        placeholder={t.settingsPage.cityCountry}
                    />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="website" className="text-xs text-white/50 flex items-center gap-2">
                            <Globe className="h-3 w-3" strokeWidth={1.5} />
                            {t.settingsPage.website}
                        </Label>
                        <Input
                            id="website"
                            value={profile.website}
                            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                            className={cn(
                                "h-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.12] focus-visible:ring-0 rounded-xl",
                                errors.website && "border-red-500/50"
                            )}
                            placeholder="https://yoursite.com"
                        />
                        {errors.website && <p className="text-xs text-red-400">{errors.website}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="github" className="text-xs text-white/50 flex items-center gap-2">
                            <Github className="h-3 w-3" strokeWidth={1.5} />
                            GitHub
                        </Label>
                        <Input
                            id="github"
                            value={profile.github}
                            onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                            className="h-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.12] focus-visible:ring-0 rounded-xl"
                            placeholder="username"
                        />
                    </div>
                </div>
            </div>

            <Button
                className="gap-2 bg-white text-black hover:bg-white/90 rounded-xl h-10 font-medium transition-all"
                onClick={handleSave}
                disabled={saving}
            >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" strokeWidth={2} />}
                {saving ? t.settingsPage.saving : t.settingsPage.saveChanges}
            </Button>
        </div>
    )
}
