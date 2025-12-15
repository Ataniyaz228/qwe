"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Camera, Github, Twitter, Globe, Save, Loader2 } from "lucide-react"

export function SettingsProfile() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [profile, setProfile] = useState({
    displayName: "Alex Developer",
    username: "alexdev",
    email: "alex@example.com",
    bio: "Full-stack developer passionate about clean code and open source.",
    website: "https://alexdev.io",
    github: "alexdev",
    twitter: "alexdev",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 2MB.",
          variant: "destructive",
        })
        return
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select a JPG, PNG, or GIF image.",
          variant: "destructive",
        })
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!profile.displayName.trim()) {
      newErrors.displayName = "Display name is required"
    }
    if (!profile.username.trim()) {
      newErrors.username = "Username is required"
    } else if (!/^[a-zA-Z0-9_]+$/.test(profile.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores"
    }
    if (!profile.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (profile.bio.length > 160) {
      newErrors.bio = "Bio must be 160 characters or less"
    }
    if (profile.website && !/^https?:\/\/.+/.test(profile.website)) {
      newErrors.website = "Please enter a valid URL starting with http:// or https://"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)

    toast({
      title: "Profile updated",
      description: "Your profile has been saved successfully.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-border">
            <AvatarImage src={avatarPreview || "/developer-avatar.png"} />
            <AvatarFallback>AD</AvatarFallback>
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
          <h3 className="font-semibold">Profile Photo</h3>
          <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
          {avatarPreview && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setAvatarPreview(null)}
            >
              Remove photo
            </Button>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              className={`bg-card border-border ${errors.displayName ? "border-destructive" : ""}`}
            />
            {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className={`bg-card border-border pl-8 ${errors.username ? "border-destructive" : ""}`}
              />
            </div>
            {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className={`bg-card border-border ${errors.email ? "border-destructive" : ""}`}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className={`bg-card border-border min-h-[100px] resize-none ${errors.bio ? "border-destructive" : ""}`}
            placeholder="Tell us about yourself..."
          />
          <div className="flex justify-between">
            <p className={`text-xs ${profile.bio.length > 160 ? "text-destructive" : "text-muted-foreground"}`}>
              {profile.bio.length}/160 characters
            </p>
            {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
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

        <div className="grid gap-4 sm:grid-cols-2">
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
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="twitter"
                value={profile.twitter}
                onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                className="bg-card border-border pl-10"
                placeholder="username"
              />
            </div>
          </div>
        </div>
      </div>

      <Button className="gap-2" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}
