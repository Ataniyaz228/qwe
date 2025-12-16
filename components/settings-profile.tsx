"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Github, Globe, Save, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { usersAPI } from "@/lib/api"
import { toast } from "sonner"

export function SettingsProfile() {
    const { user, refreshUser } = useAuth()
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

    // Загрузка данных пользователя
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
                toast.error("Файл слишком большой. Максимум 5MB.")
                return
            }
            if (!file.type.startsWith("image/")) {
                toast.error("Выберите изображение (JPG, PNG, GIF, WebP)")
                return
            }

            // Показать превью сразу
            const reader = new FileReader()
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)

            // Загрузить на сервер
            try {
                toast.loading("Загрузка аватара...")
                const result = await usersAPI.uploadAvatar(file)
                toast.dismiss()
                toast.success("Аватар обновлён!")

                // Обновить данные пользователя
                if (refreshUser) {
                    await refreshUser()
                }
            } catch (err) {
                console.error("Avatar upload error:", err)
                toast.dismiss()
                toast.error(err instanceof Error ? err.message : "Ошибка загрузки аватара")
                setAvatarPreview(null) // Сбросить превью при ошибке
            }
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!profile.display_name.trim()) {
            newErrors.display_name = "Имя обязательно"
        }
        if (profile.bio.length > 160) {
            newErrors.bio = "Био должно быть не более 160 символов"
        }
        if (profile.website && !/^https?:\/\/.+/.test(profile.website)) {
            newErrors.website = "URL должен начинаться с http:// или https://"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) {
            toast.error("Исправьте ошибки перед сохранением")
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

            toast.success("Профиль сохранён!")
        } catch (err) {
            console.error("Error saving profile:", err)
            toast.error("Ошибка сохранения профиля")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
                <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-border">
                        <AvatarImage src={avatarPreview || user?.avatar || "/developer-avatar.png"} />
                        <AvatarFallback>{profile.display_name?.[0] || profile.username?.[0] || "?"}</AvatarFallback>
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
                        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Camera className="h-4 w-4" />
                    </Button>
                </div>
                <div>
                    <h3 className="font-semibold">Фото профиля</h3>
                    <p className="text-sm text-muted-foreground">JPG, PNG или GIF. Максимум 2MB.</p>
                    {avatarPreview && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setAvatarPreview(null)}
                        >
                            Удалить фото
                        </Button>
                    )}
                </div>
            </div>

            {/* Form Fields */}
            <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="display_name">Отображаемое имя</Label>
                        <Input
                            id="display_name"
                            value={profile.display_name}
                            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                            className={`bg-card border-border ${errors.display_name ? "border-destructive" : ""}`}
                        />
                        {errors.display_name && <p className="text-xs text-destructive">{errors.display_name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Имя пользователя</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                            <Input
                                id="username"
                                value={profile.username}
                                disabled
                                className="bg-card border-border pl-8 opacity-50"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Имя пользователя изменить нельзя</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="bg-card border-border opacity-50"
                    />
                    <p className="text-xs text-muted-foreground">Email изменить нельзя</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">О себе</Label>
                    <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className={`bg-card border-border min-h-[100px] resize-none ${errors.bio ? "border-destructive" : ""}`}
                        placeholder="Расскажите о себе..."
                    />
                    <div className="flex justify-between">
                        <p className={`text-xs ${profile.bio.length > 160 ? "text-destructive" : "text-muted-foreground"}`}>
                            {profile.bio.length}/160 символов
                        </p>
                        {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">Местоположение</Label>
                    <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="bg-card border-border"
                        placeholder="Город, Страна"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="website">Веб-сайт</Label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="website"
                                value={profile.website}
                                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                className={`bg-card border-border pl-10 ${errors.website ? "border-destructive" : ""}`}
                                placeholder="https://yoursite.com"
                            />
                        </div>
                        {errors.website && <p className="text-xs text-destructive">{errors.website}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="github">GitHub</Label>
                        <div className="relative">
                            <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="github"
                                value={profile.github}
                                onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                                className="bg-card border-border pl-10"
                                placeholder="username"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Button className="gap-2" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Сохранение..." : "Сохранить"}
            </Button>
        </div>
    )
}
