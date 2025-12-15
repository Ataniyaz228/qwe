"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  Save,
  Bell,
  Mail,
  MessageSquare,
  Heart,
  Users,
  Newspaper,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"

export function SettingsNotifications() {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [notifications, setNotifications] = useState({
    emailLikes: true,
    emailComments: true,
    emailFollowers: false,
    emailMentions: true,
    emailDigest: true,
    pushLikes: false,
    pushComments: true,
    pushFollowers: true,
    pushMentions: true,
  })

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] })
  }

  const enableAllEmail = () => {
    setNotifications({
      ...notifications,
      emailLikes: true,
      emailComments: true,
      emailFollowers: true,
      emailMentions: true,
      emailDigest: true,
    })
  }

  const disableAllEmail = () => {
    setNotifications({
      ...notifications,
      emailLikes: false,
      emailComments: false,
      emailFollowers: false,
      emailMentions: false,
      emailDigest: false,
    })
  }

  const enableAllPush = () => {
    setNotifications({
      ...notifications,
      pushLikes: true,
      pushComments: true,
      pushFollowers: true,
      pushMentions: true,
    })
  }

  const disableAllPush = () => {
    setNotifications({
      ...notifications,
      pushLikes: false,
      pushComments: false,
      pushFollowers: false,
      pushMentions: false,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSaving(false)

    toast({
      title: "Notifications updated",
      description: "Your notification preferences have been saved.",
    })
  }

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Email Notifications</h3>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={enableAllEmail} className="gap-1 h-7 text-xs bg-transparent">
              <ToggleRight className="h-3 w-3" />
              Enable All
            </Button>
            <Button variant="outline" size="sm" onClick={disableAllEmail} className="gap-1 h-7 text-xs bg-transparent">
              <ToggleLeft className="h-3 w-3" />
              Disable All
            </Button>
          </div>
        </div>

        <div className="space-y-4 pl-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Likes</p>
                <p className="text-sm text-muted-foreground">When someone likes your snippet</p>
              </div>
            </div>
            <Switch checked={notifications.emailLikes} onCheckedChange={() => toggleNotification("emailLikes")} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Comments</p>
                <p className="text-sm text-muted-foreground">When someone comments on your snippet</p>
              </div>
            </div>
            <Switch checked={notifications.emailComments} onCheckedChange={() => toggleNotification("emailComments")} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">New Followers</p>
                <p className="text-sm text-muted-foreground">When someone follows you</p>
              </div>
            </div>
            <Switch
              checked={notifications.emailFollowers}
              onCheckedChange={() => toggleNotification("emailFollowers")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground font-bold">@</span>
              <div>
                <p className="font-medium">Mentions</p>
                <p className="text-sm text-muted-foreground">When someone mentions you</p>
              </div>
            </div>
            <Switch checked={notifications.emailMentions} onCheckedChange={() => toggleNotification("emailMentions")} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Newspaper className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Weekly Digest</p>
                <p className="text-sm text-muted-foreground">Weekly summary of trending snippets</p>
              </div>
            </div>
            <Switch checked={notifications.emailDigest} onCheckedChange={() => toggleNotification("emailDigest")} />
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Push Notifications</h3>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={enableAllPush} className="gap-1 h-7 text-xs bg-transparent">
              <ToggleRight className="h-3 w-3" />
              Enable All
            </Button>
            <Button variant="outline" size="sm" onClick={disableAllPush} className="gap-1 h-7 text-xs bg-transparent">
              <ToggleLeft className="h-3 w-3" />
              Disable All
            </Button>
          </div>
        </div>

        <div className="space-y-4 pl-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Likes</p>
                <p className="text-sm text-muted-foreground">When someone likes your snippet</p>
              </div>
            </div>
            <Switch checked={notifications.pushLikes} onCheckedChange={() => toggleNotification("pushLikes")} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Comments</p>
                <p className="text-sm text-muted-foreground">When someone comments on your snippet</p>
              </div>
            </div>
            <Switch checked={notifications.pushComments} onCheckedChange={() => toggleNotification("pushComments")} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">New Followers</p>
                <p className="text-sm text-muted-foreground">When someone follows you</p>
              </div>
            </div>
            <Switch checked={notifications.pushFollowers} onCheckedChange={() => toggleNotification("pushFollowers")} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground font-bold">@</span>
              <div>
                <p className="font-medium">Mentions</p>
                <p className="text-sm text-muted-foreground">When someone mentions you</p>
              </div>
            </div>
            <Switch checked={notifications.pushMentions} onCheckedChange={() => toggleNotification("pushMentions")} />
          </div>
        </div>
      </div>

      <Button className="gap-2" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "Saving..." : "Save Notifications"}
      </Button>
    </div>
  )
}
