"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  LinkIcon,
  Github,
  Calendar,
  MessageSquare,
  Code2,
  Heart,
  Bookmark,
  Settings,
  Share2,
  Loader2,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { usersAPI, postsAPI } from "@/lib/api"
import type { Post, Tag } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const languageColors: Record<string, string> = {
  typescript: "bg-blue-500",
  javascript: "bg-yellow-500",
  python: "bg-green-500",
  rust: "bg-orange-500",
  go: "bg-cyan-500",
  java: "bg-red-500",
  csharp: "bg-purple-500",
  css: "bg-purple-500",
}

interface PostCardProps {
  post: Post
}

function PostCard({ post }: PostCardProps) {
  const langColor = languageColors[post.language?.toLowerCase() || ""] || "bg-gray-500"

  return (
    <Link href={`/post/${post.id}`}>
      <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("h-3 w-3 rounded-full", langColor)} />
              <span className="text-sm text-muted-foreground">{post.language || "Unknown"}</span>
            </div>
            <h3 className="font-semibold font-mono text-primary hover:underline">
              {post.filename || post.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {post.description || "Нет описания"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className={cn("h-4 w-4", post.is_liked && "fill-red-500 text-red-500")} />
            {post.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {post.comments_count}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {post.views}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const [activeTab, setActiveTab] = useState("posts")
  const [posts, setPosts] = useState<Post[]>([])
  const [bookmarks, setBookmarks] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
  })

  // Редирект если не авторизован
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  // Загрузка данных профиля
  useEffect(() => {
    if (!user?.username) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [postsData, bookmarksData, followersData, followingData] = await Promise.all([
          usersAPI.getPosts(user.username),
          postsAPI.bookmarks(),
          usersAPI.getFollowers(user.username).catch(() => ({ results: [] })),
          usersAPI.getFollowing(user.username).catch(() => ({ results: [] })),
        ])

        setPosts(postsData.results || [])
        setBookmarks(bookmarksData.results || [])
        setStats({
          posts: postsData.results?.length || 0,
          followers: followersData.results?.length || 0,
          following: followingData.results?.length || 0,
        })
      } catch (err) {
        console.error("Error fetching profile data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.username])

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success("Ссылка скопирована!")
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
  }

  // Показываем загрузку пока проверяем авторизацию
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-primary/20">
                    <AvatarImage src={user.avatar || "/developer-avatar.png"} />
                    <AvatarFallback className="text-2xl">
                      {user.display_name?.[0] || user.username?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{user.display_name || user.username}</h1>
                        {user.is_verified && (
                          <Badge className="bg-primary/20 text-primary border-0">Verified</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">@{user.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="h-4 w-4 mr-1" />
                        Поделиться
                      </Button>
                      <Link href="/settings">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Редактировать
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {user.bio && (
                    <p className="mt-3 text-foreground/90">{user.bio}</p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                    {user.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {user.location}
                      </span>
                    )}
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <LinkIcon className="h-4 w-4" />
                        {user.website.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                    {user.github_username && (
                      <a
                        href={`https://github.com/${user.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Github className="h-4 w-4" />
                        {user.github_username}
                      </a>
                    )}
                    {user.date_joined && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Присоединился {formatDate(user.date_joined)}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 mt-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-xl font-bold">{stats.posts}</p>
                      <p className="text-xs text-muted-foreground">Посты</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">{stats.followers}</p>
                      <p className="text-xs text-muted-foreground">Подписчики</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">{stats.following}</p>
                      <p className="text-xs text-muted-foreground">Подписки</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start bg-card border border-border h-auto p-1 gap-1">
                <TabsTrigger
                  value="posts"
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Code2 className="h-4 w-4" />
                  Посты ({posts.length})
                </TabsTrigger>
                <TabsTrigger
                  value="bookmarks"
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Bookmark className="h-4 w-4" />
                  Закладки ({bookmarks.length})
                </TabsTrigger>
              </TabsList>

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Posts Tab */}
              <TabsContent value="posts" className="mt-4 space-y-4">
                {!loading && posts.length > 0 ? (
                  posts.map((post) => <PostCard key={post.id} post={post} />)
                ) : !loading ? (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <Code2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Пока нет постов</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Создайте свой первый сниппет кода
                    </p>
                    <Link href="/create">
                      <Button>Создать пост</Button>
                    </Link>
                  </div>
                ) : null}
              </TabsContent>

              {/* Bookmarks Tab */}
              <TabsContent value="bookmarks" className="mt-4 space-y-4">
                {!loading && bookmarks.length > 0 ? (
                  bookmarks.map((post) => <PostCard key={post.id} post={post} />)
                ) : !loading ? (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Нет закладок</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Сохраняйте интересные посты для быстрого доступа
                    </p>
                    <Link href="/explore">
                      <Button variant="outline">Найти сниппеты</Button>
                    </Link>
                  </div>
                ) : null}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
