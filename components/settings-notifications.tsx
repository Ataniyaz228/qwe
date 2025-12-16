"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
import { toast } from "sonner"

export function SettingsNotifications() {
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

  // Загрузка настроек из localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gitforum-notifications")
    if (saved) {
      try {
        setNotifications(JSON.parse(saved))
      } catch (e) {
        // Ignore
      }
    }
  }, [])

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
    await new Promise((resolve) => setTimeout(resolve, 500))

    localStorage.setItem("gitforum-notifications", JSON.stringify(notifications))

    setSaving(false)
    toast.success("Настройки уведомлений сохранены!")
  }

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Email уведомления</h3>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={enableAllEmail} className="gap-1 h-7 text-xs bg-transparent">
              <ToggleRight className="h-3 w-3" />
              Вкл. все
            </Button>
            <Button variant="outline" size="sm" onClick={disableAllEmail} className="gap-1 h-7 text-xs bg-transparent">
              <ToggleLeft className="h-3 w-3" />
              Выкл. все
            </Button>
          </div>
        </div>

        <div className="space-y-4 pl-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Лайки</p>
                <p className="text-sm text-muted-foreground">Когда кто-то лайкнул ваш пост</p>
              </div>
            </div>
            <Switch checked={notifications.emailLikes} onCheckedChange={() => toggleNotification("emailLikes")} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Комментарии</p>
                <p className="text-sm text-muted-foreground">Когда кто-то оставил комментарий</p>
              </div>
            </div>
            <Switch checked={notifications.emailComments} onCheckedChange={() => toggleNotification("emailComments")} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Новые подписчики</p>
                <p className="text-sm text-muted-foreground">Когда кто-то подписался на вас</p>
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
                <p className="font-medium">Упоминания</p>
                <p className="text-sm text-muted-foreground">Когда вас упомянули</p>
              </div>
            </div>
            <Switch checked={notifications.emailMentions} onCheckedChange={() => toggleNotification("emailMentions")} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Newspaper className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Еженедельный дайджест</p>
                <p className="text-sm text-muted-foreground">Подборка лучших постов за неделю</p>
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
            <h3 className="font-semibold">Push уведомления</h3>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={enableAllPush} className="gap-1 h-7 text-xs bg-transparent">
              <ToggleRight className="h-3 w-3" />
              Вкл. все
            </Button>
            <Button variant="outline" size="sm" onClick={disableAllPush} className="gap-1 h-7 text-xs bg-transparent">
              <ToggleLeft className="h-3 w-3" />
              Выкл. все
            </Button>
          </div>
        </div>

        <div className="space-y-4 pl-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Лайки</p>
                <p className="text-sm text-muted-foreground">Когда кто-то лайкнул ваш пост</p>
              </div>
            </div>
            <Switch checked={notifications.pushLikes} onCheckedChange={() => toggleNotification("pushLikes")} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Комментарии</p>
                <p className="text-sm text-muted-foreground">Когда кто-то оставил комментарий</p>
              </div>
            </div>
            <Switch checked={notifications.pushComments} onCheckedChange={() => toggleNotification("pushComments")} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Новые подписчики</p>
                <p className="text-sm text-muted-foreground">Когда кто-то подписался на вас</p>
              </div>
            </div>
            <Switch checked={notifications.pushFollowers} onCheckedChange={() => toggleNotification("pushFollowers")} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground font-bold">@</span>
              <div>
                <p className="font-medium">Упоминания</p>
                <p className="text-sm text-muted-foreground">Когда вас упомянули</p>
              </div>
            </div>
            <Switch checked={notifications.pushMentions} onCheckedChange={() => toggleNotification("pushMentions")} />
          </div>
        </div>
      </div>

      <Button className="gap-2" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "Сохранение..." : "Сохранить настройки"}
      </Button>
    </div>
  )
}
