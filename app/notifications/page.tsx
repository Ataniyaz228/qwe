"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell, Heart, MessageSquare, UserPlus, Reply, Check, Loader2, FileCode, Sparkles, BellOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
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

// Function will be defined inside component to use translations

export default function NotificationsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { t, language } = useLanguage()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingRead, setMarkingRead] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Translation-aware message map
  const getMessageForType = (type: string) => {
    const messages: Record<string, string> = {
      follow: t.notifications.followed,
      like: t.notifications.liked,
      comment: t.notifications.commented,
      reply: t.notifications.replied,
      new_post: t.notifications.newPost,
    }
    return messages[type] || ''
  }

  // Translation-aware time formatter
  const formatTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return t.notifications.justNow
    if (minutes < 60) return `${minutes}м`
    if (hours < 24) return `${hours}ч`
    if (days < 7) return `${days}д`
    return date.toLocaleDateString(language === 'kk' ? 'kk-KZ' : 'ru-RU')
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

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
      toast.success(t.notifications.allMarkedRead)
    } catch (err) {
      toast.error(t.notifications.updateError)
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

    if (notification.post_id) {
      router.push(`/post/${notification.post_id}`)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center animate-pulse">
          <Loader2 className="h-5 w-5 animate-spin text-white/40" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-white/[0.01] rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeSlideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56 relative z-10">
          <div className="mx-auto max-w-2xl px-4 py-6">

            {/* Header */}
            <div className={cn(
              "flex items-center justify-between mb-6 transition-all duration-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            )}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white/50" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white/90">{t.notifications.title}</h1>
                  <p className="text-xs text-white/35">
                    {unreadCount > 0 ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                        {unreadCount} {t.notifications.unread}
                      </span>
                    ) : t.notifications.allRead}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.05] hover:text-white/70 rounded-xl transition-all duration-300"
                  onClick={handleMarkAllRead}
                  disabled={markingRead}
                >
                  {markingRead ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  {t.notifications.markAllRead}
                </Button>
              )}
            </div>

            {/* Stats Row */}
            <div className={cn(
              "grid grid-cols-3 gap-3 mb-6 transition-all duration-500 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              {[
                { label: t.notifications.total, value: notifications.length, icon: Bell },
                { label: t.notifications.unreadCount, value: unreadCount, icon: Sparkles },
                {
                  label: t.notifications.today, value: notifications.filter(n => {
                    const today = new Date()
                    const notifDate = new Date(n.created_at)
                    return notifDate.toDateString() === today.toDateString()
                  }).length, icon: Heart
                },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] text-center transition-all duration-300"
                  style={{ animationDelay: `${150 + i * 50}ms` }}
                >
                  <stat.icon className="h-4 w-4 mx-auto mb-2 text-white/20 group-hover:text-white/40 transition-colors" strokeWidth={1.5} />
                  <p className="text-lg font-medium text-white/70">{stat.value}</p>
                  <p className="text-[10px] text-white/25">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-white/30 mb-3" />
                <p className="text-xs text-white/20">{t.notifications.loading}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && notifications.length === 0 && (
              <div className={cn(
                "rounded-2xl border border-white/[0.04] bg-gradient-to-b from-white/[0.02] to-transparent p-16 text-center transition-all duration-500 delay-200",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <div className="h-16 w-16 mx-auto mb-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <BellOff className="h-7 w-7 text-white/20" strokeWidth={1} />
                </div>
                <h3 className="font-medium text-white/60 mb-2">{t.notifications.empty}</h3>
                <p className="text-sm text-white/30 mb-6 max-w-xs mx-auto">
                  {t.notifications.emptySubtitle}
                </p>
                <Link href="/explore">
                  <Button variant="outline" className="gap-2 bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06] rounded-xl transition-all duration-300">
                    {t.notifications.explorePosts}
                  </Button>
                </Link>
              </div>
            )}

            {/* Notifications List */}
            {!loading && notifications.length > 0 && (
              <div className={cn(
                "space-y-2 transition-all duration-500 delay-200",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                {notifications.map((notification, index) => {
                  const Icon = iconMap[notification.notification_type] || Bell

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer",
                        notification.is_read
                          ? "bg-white/[0.01] border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
                          : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.04]"
                      )}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: 'slideIn 0.4s ease-out forwards',
                        opacity: 0,
                        transform: 'translateX(-10px)'
                      }}
                    >
                      {/* Unread Indicator + Avatar */}
                      <div className="relative">
                        <Avatar className="h-11 w-11 border border-white/[0.08] transition-all group-hover:border-white/[0.15]">
                          <AvatarImage src={notification.sender?.avatar || "/developer-avatar.png"} />
                          <AvatarFallback className="bg-white/[0.04] text-white/40 text-sm">
                            {notification.sender?.display_name?.[0] || notification.sender?.username?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        {!notification.is_read && (
                          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-blue-500 border-2 border-[#09090b] animate-pulse" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-5 w-5 rounded-md bg-white/[0.04] flex items-center justify-center">
                            <Icon className="h-3 w-3 text-white/40" strokeWidth={1.5} />
                          </div>
                          <span className="text-sm text-white/70">
                            <span className="font-medium text-white/80">
                              {notification.sender?.display_name || notification.sender?.username}
                            </span>{" "}
                            <span className="text-white/40">
                              {getMessageForType(notification.notification_type)}
                            </span>
                          </span>
                        </div>

                        {notification.post_title && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.04] mt-1">
                            <FileCode className="h-3 w-3 text-white/30" strokeWidth={1.5} />
                            <span className="font-mono text-xs text-white/50">{notification.post_title}</span>
                          </div>
                        )}

                        {notification.message && (
                          <p className="text-xs text-white/30 line-clamp-1 mt-1.5 italic">
                            "{notification.message}"
                          </p>
                        )}

                        <span className="text-[10px] text-white/20 mt-2 block">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>

                      {/* Chevron on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                        <svg className="h-4 w-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
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
