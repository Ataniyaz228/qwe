"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Heart, MessageSquare, UserPlus, Reply, Check, Loader2, FileCode } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { notificationsAPI, type Notification } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

const iconMap: Record<string, typeof Bell> = {
  follow: UserPlus,
  like: Heart,
  comment: MessageSquare,
  reply: Reply,
  new_post: FileCode,
}

const colorMap: Record<string, string> = {
  follow: "text-primary",
  like: "text-red-400",
  comment: "text-blue-400",
  reply: "text-purple-400",
  new_post: "text-green-400",
}

const messageMap: Record<string, string> = {
  follow: "подписался(-ась) на вас",
  like: "лайкнул(-а) ваш пост",
  comment: "прокомментировал(-а) ваш пост",
  reply: "ответил(-а) на ваш комментарий",
  new_post: "опубликовал(-а) новый пост",
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "только что"
  if (minutes < 60) return `${minutes}м назад`
  if (hours < 24) return `${hours}ч назад`
  if (days < 7) return `${days}д назад`
  return date.toLocaleDateString("ru-RU")
}

export default function NotificationsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingRead, setMarkingRead] = useState(false)

  // Редирект если не авторизован
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, authLoading, router])

  // Загрузка уведомлений
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchNotifications = async () => {
      try {
        const data = await notificationsAPI.list()
        setNotifications(data)
      } catch (err) {
        console.error("Error fetching notifications:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [isAuthenticated])

  const handleMarkAllRead = async () => {
    setMarkingRead(true)
    try {
      await notificationsAPI.markAllRead()
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      toast.success("Все уведомления прочитаны")
    } catch (err) {
      toast.error("Ошибка при обновлении")
    } finally {
      setMarkingRead(false)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await notificationsAPI.markRead(notification.id)
        setNotifications(notifications.map(n =>
          n.id === notification.id ? { ...n, is_read: true } : n
        ))
      } catch (err) {
        // Ignore error
      }
    }

    // Переход к посту если есть
    if (notification.post_id) {
      router.push(`/post/${notification.post_id}`)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  // Показываем загрузку пока проверяем авторизацию
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56">
          <div className="mx-auto max-w-2xl px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  <Bell className="h-6 w-6 text-primary" />
                  Уведомления
                </h1>
                <p className="text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} непрочитанных` : "Всё прочитано!"}
                </p>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 bg-transparent"
                  onClick={handleMarkAllRead}
                  disabled={markingRead}
                >
                  {markingRead ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Прочитать все
                </Button>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Empty State */}
            {!loading && notifications.length === 0 && (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Нет уведомлений</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Здесь будут появляться уведомления о лайках, комментариях и подписках
                </p>
                <Link href="/explore">
                  <Button variant="outline">Исследовать посты</Button>
                </Link>
              </div>
            )}

            {/* Notifications List */}
            {!loading && notifications.length > 0 && (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                {notifications.map((notification, index) => {
                  const Icon = iconMap[notification.notification_type]
                  const iconColor = colorMap[notification.notification_type]

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "flex items-start gap-4 p-4 transition-colors hover:bg-secondary/50 cursor-pointer",
                        index !== notifications.length - 1 && "border-b border-border",
                        !notification.is_read && "bg-primary/5",
                      )}
                    >
                      {/* Unread Indicator */}
                      <div className="flex items-center gap-3">
                        {!notification.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                        {notification.is_read && <span className="h-2 w-2 shrink-0" />}
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={notification.sender?.avatar || "/developer-avatar.png"} />
                          <AvatarFallback>
                            {notification.sender?.display_name?.[0] || notification.sender?.username?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
                          <span className="text-sm">
                            <span className="font-semibold">
                              {notification.sender?.display_name || notification.sender?.username}
                            </span>{" "}
                            <span className="text-muted-foreground">
                              {messageMap[notification.notification_type]}
                            </span>
                          </span>
                        </div>

                        {notification.post_title && (
                          <Badge variant="secondary" className="font-mono text-xs mb-1">
                            {notification.post_title}
                          </Badge>
                        )}

                        {notification.message && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            "{notification.message}"
                          </p>
                        )}

                        <span className="text-xs text-muted-foreground mt-1 block">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
