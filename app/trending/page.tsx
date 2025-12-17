"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Search,
  Flame,
  Clock,
  Calendar,
  CalendarDays,
  Filter,
  ArrowUpDown,
  TrendingUp,
  Heart,
  MessageSquare,
  Eye,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { postsAPI } from "@/lib/api"
import type { Post, Tag } from "@/lib/api"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const defaultLanguages = ["All", "JavaScript", "Python", "TypeScript", "Go", "Rust", "CSS", "Java"]

// Цвета языков
const languageColors: Record<string, string> = {
  javascript: "bg-yellow-500",
  typescript: "bg-blue-500",
  python: "bg-green-500",
  rust: "bg-orange-500",
  go: "bg-cyan-500",
  java: "bg-red-500",
  csharp: "bg-purple-500",
  css: "bg-purple-500",
  react: "bg-cyan-400",
}

interface TrendingCardProps {
  post: Post
  rank: number
}

function TrendingCard({ post, rank }: TrendingCardProps) {
  const langColor = languageColors[post.language?.toLowerCase() || ""] || "bg-gray-500"
  const tags = post.tags?.map((t: Tag) => t.name) || []
  const isHot = (post.likes_count || 0) > 5 || (post.views || 0) > 50

  return (
    <Link href={`/post/${post.id}`}>
      <div className="group relative flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all cursor-pointer">
        {/* Rank */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className={cn(
            "text-2xl font-bold",
            rank === 1 ? "text-yellow-500" :
              rank === 2 ? "text-gray-400" :
                rank === 3 ? "text-amber-600" : "text-muted-foreground"
          )}>
            #{rank}
          </span>
          {isHot && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 text-orange-500 border-orange-500/50">
              HOT
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {post.filename || post.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className={cn("h-2.5 w-2.5 rounded-full", langColor)} />
                <span className="text-xs text-muted-foreground">{post.language || "Unknown"}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {post.description || "Нет описания"}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.slice(0, 4).map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs font-normal px-2 py-0">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={post.author?.avatar || "/developer-avatar.png"} />
                <AvatarFallback className="text-[10px]">
                  {post.author?.username?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {post.author?.display_name || post.author?.username}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className={cn("h-3.5 w-3.5", post.is_liked && "fill-red-500 text-red-500")} />
                {post.likes_count}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {post.comments_count}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {post.views}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function TrendingPage() {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTime, setActiveTime] = useState("week")
  const [activeLanguage, setActiveLanguage] = useState("All")
  const [sortBy, setSortBy] = useState("likes")

  const timeFilters = [
    { id: "today", label: t.common.today, icon: Clock },
    { id: "week", label: t.common.thisWeek, icon: Calendar },
    { id: "month", label: t.common.thisMonth, icon: CalendarDays },
  ]

  const sortOptions = [
    { id: "likes", label: t.common.likes, icon: Heart },
    { id: "views", label: t.common.views, icon: Eye },
    { id: "comments", label: t.common.comments, icon: MessageSquare },
  ]

  // Загрузка трендовых постов
  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true)
      try {
        const period = activeTime as 'today' | 'week' | 'month'
        const data = await postsAPI.trending(period)
        setPosts(Array.isArray(data) ? data : (data as unknown as { results: Post[] }).results || [])
      } catch (err) {
        console.error("Error fetching trending:", err)
        setError("Ошибка загрузки")
      } finally {
        setIsLoading(false)
      }
    }
    fetchTrending()
  }, [activeTime])

  // Получаем уникальные языки из постов
  const languages = useMemo(() => {
    const unique = new Set(posts.map(p => p.language).filter(Boolean))
    return ["All", ...Array.from(unique)]
  }, [posts])

  const filteredAndSortedPosts = useMemo(() => {
    // Относительные периоды (последние N часов/дней)
    const now = Date.now()
    const last24h = now - 24 * 60 * 60 * 1000
    const last7days = now - 7 * 24 * 60 * 60 * 1000
    const last30days = now - 30 * 24 * 60 * 60 * 1000

    let filtered = posts.filter((post) => {
      const matchesSearch =
        post.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some((tag: Tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesLanguage = activeLanguage === "All" ||
        post.language?.toLowerCase() === activeLanguage.toLowerCase()

      // Backend уже фильтрует по периоду, но для надёжности проверяем на клиенте
      const postTime = new Date(post.created_at || 0).getTime()
      let matchesTime = true
      if (activeTime === "today") {
        matchesTime = postTime >= last24h  // последние 24 часа
      } else if (activeTime === "week") {
        matchesTime = postTime >= last7days  // последние 7 дней
      } else if (activeTime === "month") {
        matchesTime = postTime >= last30days  // последние 30 дней
      }

      return matchesSearch && matchesLanguage && matchesTime
    })

    // Сортировка
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "likes":
          return (b.likes_count || 0) - (a.likes_count || 0)
        case "views":
          return (b.views || 0) - (a.views || 0)
        case "comments":
          return (b.comments_count || 0) - (a.comments_count || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [posts, searchQuery, activeLanguage, activeTime, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />

      <main className="pt-5 md:pl-16 lg:pl-68">
        <div className="max-w-5xl px-6 md:px-8 lg:px-10 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="h-8 w-8 text-orange-500" />
              <h1 className="text-3xl font-bold">{t.trending.title}</h1>
            </div>
            <p className="text-muted-foreground">
              {t.trending.subtitle}
            </p>
          </div>

          {/* How Trending Works */}
          <div className="mb-6 p-4 rounded-lg border border-border bg-card/50">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Как это работает
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Посты ранжируются по <span className="text-foreground font-medium">популярности</span> —
              количество лайков, комментариев и просмотров. Посты с пометкой{" "}
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-orange-500 border-orange-500/50">
                HOT
              </Badge>{" "}
              имеют высокую активность.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                className="pl-9 bg-card border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Time Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {timeFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeTime === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTime(filter.id)}
                  className={cn("gap-1.5", activeTime === filter.id && "bg-primary text-primary-foreground")}
                >
                  <filter.icon className="h-3.5 w-3.5" />
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex flex-wrap items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-1">Сортировка:</span>
              {sortOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={sortBy === option.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy(option.id)}
                  className={cn("gap-1.5", sortBy === option.id && "bg-secondary")}
                >
                  <option.icon className="h-3.5 w-3.5" />
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Language Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {(languages.length > 1 ? languages : defaultLanguages).map((lang) => (
                <Badge
                  key={lang}
                  variant={activeLanguage === lang ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors",
                    activeLanguage === lang ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                  onClick={() => setActiveLanguage(lang)}
                >
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <>
              {/* Results count */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  {filteredAndSortedPosts.length} {t.common.posts.toLowerCase()}
                </span>
              </div>

              {/* Trending List */}
              <div className="space-y-4">
                {filteredAndSortedPosts.map((post, index) => (
                  <TrendingCard key={post.id} post={post} rank={index + 1} />
                ))}
              </div>

              {filteredAndSortedPosts.length === 0 && (
                <div className="text-center py-12">
                  <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Нет trending постов</h3>
                  <p className="text-sm text-muted-foreground">
                    {posts.length === 0
                      ? "Создайте первый пост!"
                      : "Попробуйте изменить фильтры"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
