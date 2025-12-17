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
  AtSign,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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

  const NotificationItem = ({
    icon: Icon,
    title,
    description,
    checked,
    onChange
  }: {
    icon: React.ElementType
    title: string
    description: string
    checked: boolean
    onChange: () => void
  }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] transition-all hover:border-white/[0.08] group">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-white/[0.04] flex items-center justify-center group-hover:bg-white/[0.06] transition-colors">
          <Icon className="h-4 w-4 text-white/40" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium text-white/70">{title}</p>
          <p className="text-[11px] text-white/30">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-white/50" strokeWidth={1.5} />
            <div>
              <h3 className="text-sm font-medium text-white/70">Email уведомления</h3>
              <p className="text-[11px] text-white/30">Уведомления на почту</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={enableAllEmail}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] text-[10px] text-white/40 hover:bg-white/[0.08] hover:text-white/60 transition-all"
            >
              <ToggleRight className="h-3 w-3" strokeWidth={1.5} />
              Вкл
            </button>
            <button
              onClick={disableAllEmail}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] text-[10px] text-white/40 hover:bg-white/[0.08] hover:text-white/60 transition-all"
            >
              <ToggleLeft className="h-3 w-3" strokeWidth={1.5} />
              Выкл
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <NotificationItem
            icon={Heart}
            title="Лайки"
            description="Когда кто-то лайкнул ваш пост"
            checked={notifications.emailLikes}
            onChange={() => toggleNotification("emailLikes")}
          />
          <NotificationItem
            icon={MessageSquare}
            title="Комментарии"
            description="Когда кто-то оставил комментарий"
            checked={notifications.emailComments}
            onChange={() => toggleNotification("emailComments")}
          />
          <NotificationItem
            icon={Users}
            title="Новые подписчики"
            description="Когда кто-то подписался на вас"
            checked={notifications.emailFollowers}
            onChange={() => toggleNotification("emailFollowers")}
          />
          <NotificationItem
            icon={AtSign}
            title="Упоминания"
            description="Когда вас упомянули"
            checked={notifications.emailMentions}
            onChange={() => toggleNotification("emailMentions")}
          />
          <NotificationItem
            icon={Newspaper}
            title="Еженедельный дайджест"
            description="Подборка лучших постов за неделю"
            checked={notifications.emailDigest}
            onChange={() => toggleNotification("emailDigest")}
          />
        </div>
      </div>

      {/* Push Notifications */}
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-white/50" strokeWidth={1.5} />
            <div>
              <h3 className="text-sm font-medium text-white/70">Push уведомления</h3>
              <p className="text-[11px] text-white/30">Уведомления в браузере</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={enableAllPush}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] text-[10px] text-white/40 hover:bg-white/[0.08] hover:text-white/60 transition-all"
            >
              <ToggleRight className="h-3 w-3" strokeWidth={1.5} />
              Вкл
            </button>
            <button
              onClick={disableAllPush}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] text-[10px] text-white/40 hover:bg-white/[0.08] hover:text-white/60 transition-all"
            >
              <ToggleLeft className="h-3 w-3" strokeWidth={1.5} />
              Выкл
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <NotificationItem
            icon={Heart}
            title="Лайки"
            description="Когда кто-то лайкнул ваш пост"
            checked={notifications.pushLikes}
            onChange={() => toggleNotification("pushLikes")}
          />
          <NotificationItem
            icon={MessageSquare}
            title="Комментарии"
            description="Когда кто-то оставил комментарий"
            checked={notifications.pushComments}
            onChange={() => toggleNotification("pushComments")}
          />
          <NotificationItem
            icon={Users}
            title="Новые подписчики"
            description="Когда кто-то подписался на вас"
            checked={notifications.pushFollowers}
            onChange={() => toggleNotification("pushFollowers")}
          />
          <NotificationItem
            icon={AtSign}
            title="Упоминания"
            description="Когда вас упомянули"
            checked={notifications.pushMentions}
            onChange={() => toggleNotification("pushMentions")}
          />
        </div>
      </div>

      <Button
        className="gap-2 bg-white text-black hover:bg-white/90 rounded-xl h-10 font-medium"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" strokeWidth={2} />}
        {saving ? "Сохранение..." : "Сохранить настройки"}
      </Button>
    </div>
  )
}
