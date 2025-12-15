import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Heart, MessageSquare, UserPlus, GitFork, AtSign, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const notifications = [
  {
    id: "1",
    type: "follow",
    user: { name: "Sarah Chen", username: "sarahcodes", avatar: "/female-developer-avatar.png" },
    message: "started following you",
    time: "2m ago",
    read: false,
  },
  {
    id: "2",
    type: "like",
    user: { name: "Alex Rivera", username: "arivera", avatar: "/male-developer-avatar.png" },
    message: "liked your snippet",
    snippet: "useDebounce.ts",
    time: "15m ago",
    read: false,
  },
  {
    id: "3",
    type: "comment",
    user: { name: "Jordan Kim", username: "jkim_dev", avatar: "/developer-portrait.png" },
    message: "commented on your snippet",
    snippet: "async_fetcher.py",
    preview: "Great implementation! Have you considered adding retry logic?",
    time: "1h ago",
    read: false,
  },
  {
    id: "4",
    type: "mention",
    user: { name: "Maria Lopez", username: "mlopez", avatar: "/female-developer.png" },
    message: "mentioned you in a comment",
    snippet: "api-client.ts",
    preview: "@you check out this approach for error handling",
    time: "3h ago",
    read: true,
  },
  {
    id: "5",
    type: "fork",
    user: { name: "Mike Johnson", username: "mikej", avatar: "/developer-avatar.png" },
    message: "forked your snippet",
    snippet: "useDebounce.ts",
    time: "5h ago",
    read: true,
  },
  {
    id: "6",
    type: "like",
    user: { name: "Emma Wilson", username: "emmaw", avatar: "/female-developer.png" },
    message: "liked your snippet",
    snippet: "async_fetcher.py",
    time: "8h ago",
    read: true,
  },
  {
    id: "7",
    type: "follow",
    user: { name: "David Park", username: "dpark", avatar: "/male-developer.png" },
    message: "started following you",
    time: "1d ago",
    read: true,
  },
  {
    id: "8",
    type: "comment",
    user: { name: "Lisa Zhang", username: "lisaz", avatar: "/female-developer-avatar.png" },
    message: "replied to your comment",
    snippet: "rust-cli-toolkit",
    preview: "Thanks for the feedback! I've updated the error handling.",
    time: "2d ago",
    read: true,
  },
]

const iconMap = {
  follow: UserPlus,
  like: Heart,
  comment: MessageSquare,
  mention: AtSign,
  fork: GitFork,
}

const colorMap = {
  follow: "text-primary",
  like: "text-red-400",
  comment: "text-blue-400",
  mention: "text-yellow-400",
  fork: "text-green-400",
}

export default function NotificationsPage() {
  const unreadCount = notifications.filter((n) => !n.read).length

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
                  Notifications
                </h1>
                <p className="text-muted-foreground">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}</p>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
                  <Check className="h-4 w-4" />
                  Mark all read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              {notifications.map((notification, index) => {
                const Icon = iconMap[notification.type as keyof typeof iconMap]
                const iconColor = colorMap[notification.type as keyof typeof colorMap]

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-4 p-4 transition-colors hover:bg-secondary/50",
                      index !== notifications.length - 1 && "border-b border-border",
                      !notification.read && "bg-primary/5",
                    )}
                  >
                    {/* Unread Indicator */}
                    <div className="flex items-center gap-3">
                      {!notification.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                      {notification.read && <span className="h-2 w-2 shrink-0" />}
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={notification.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
                        <span className="text-sm">
                          <span className="font-semibold">{notification.user.name}</span>{" "}
                          <span className="text-muted-foreground">{notification.message}</span>
                        </span>
                      </div>

                      {notification.snippet && (
                        <Badge variant="secondary" className="font-mono text-xs mb-1">
                          {notification.snippet}
                        </Badge>
                      )}

                      {notification.preview && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">"{notification.preview}"</p>
                      )}

                      <span className="text-xs text-muted-foreground mt-1 block">{notification.time}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
