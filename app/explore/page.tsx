"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { ExploreFilters } from "@/components/explore-filters"
import { TrendingUp, Flame, Clock, Heart, MessageSquare, Eye, Loader2 } from "lucide-react"
import { postsAPI, tagsAPI } from "@/lib/api"
import type { Post, Tag } from "@/lib/api"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"

// Цвета языков
const languageColors: Record<string, string> = {
  javascript: "bg-yellow-500",
  typescript: "bg-blue-500",
  python: "bg-green-500",
  rust: "bg-orange-500",
  go: "bg-cyan-500",
  java: "bg-red-500",
  csharp: "bg-purple-500",
  cpp: "bg-pink-500",
  ruby: "bg-red-600",
  php: "bg-indigo-500",
  swift: "bg-orange-600",
  kotlin: "bg-violet-500",
}

interface PostCardProps {
  post: Post
  featured?: boolean
}

function PostCard({ post, featured }: PostCardProps) {
  const langColor = languageColors[post.language?.toLowerCase() || ""] || "bg-gray-500"
  const tags = post.tags?.map((t: Tag) => t.name) || []

  return (
    <Link href={`/post/${post.id}`} className="block">
      <article
        className={cn(
          "group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer h-full",
          featured && "row-span-2 flex flex-col",
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn("h-3 w-3 rounded-full shrink-0", langColor)} />
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {post.filename || post.title}
            </h3>
          </div>
          {post.language && (
            <Badge variant="secondary" className="font-mono text-xs shrink-0">
              {post.language}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className={cn(
          "text-sm text-muted-foreground mb-4",
          featured ? "line-clamp-4 flex-1" : "line-clamp-2"
        )}>
          {post.description || "Нет описания"}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, featured ? 5 : 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal px-2 py-0">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-border">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage src={post.author?.avatar || "/developer-avatar.png"} />
              <AvatarFallback className="text-xs">
                {post.author?.display_name?.[0] || post.author?.username?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {post.author?.display_name || post.author?.username}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground ml-auto">
            <span className="flex items-center gap-1.5">
              <Heart className={cn("h-3.5 w-3.5", post.is_liked && "fill-red-500 text-red-500")} />
              {post.likes_count}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              {post.comments_count}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              {post.views}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default function ExplorePage() {
  const searchParams = useSearchParams()
  const tagFromUrl = searchParams.get("tag")
  const { t } = useLanguage()

  const [posts, setPosts] = useState<Post[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [activeLanguage, setActiveLanguage] = useState("All")
  const [activeTags, setActiveTags] = useState<string[]>(tagFromUrl ? [tagFromUrl] : [])
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const [activeTime, setActiveTime] = useState("This Week")
  const [activeSort, setActiveSort] = useState("Most Likes")
  const [showFilters, setShowFilters] = useState(false)

  // Загрузка постов
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [postsData, tagsData] = await Promise.all([
          postsAPI.list({ page_size: 50 }),
          tagsAPI.list()
        ])
        setPosts(postsData.results || [])
        setTags(tagsData.results || tagsData || [])
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Ошибка загрузки данных")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (tagFromUrl && !activeTags.includes(tagFromUrl)) {
      setActiveTags([tagFromUrl])
    }
  }, [tagFromUrl])

  const filteredPosts = useMemo(() => {
    let items = [...posts]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      items = items.filter(
        (item) =>
          item.filename?.toLowerCase().includes(query) ||
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.tags?.some((tag: Tag) => tag.name.toLowerCase().includes(query)) ||
          item.author?.username?.toLowerCase().includes(query),
      )
    }

    // Filter by language
    if (activeLanguage !== "All") {
      items = items.filter((item) =>
        item.language?.toLowerCase() === activeLanguage.toLowerCase()
      )
    }

    // Filter by tags
    if (activeTags.length > 0) {
      items = items.filter((item) =>
        activeTags.some((tag) =>
          item.tags?.some((t: Tag) => t.name.toLowerCase() === tag.toLowerCase())
        )
      )
    }

    // Sort items
    switch (activeSort) {
      case "Most Likes":
        items.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
        break
      case "Most Comments":
        items.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0))
        break
      case "Most Views":
        items.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case "Recent":
        items.sort((a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )
        break
      default:
        break
    }

    return items
  }, [posts, searchQuery, activeLanguage, activeTags, activeSort])

  // Статистика
  const stats = useMemo(() => {
    const now = Date.now()
    const last24h = now - 24 * 60 * 60 * 1000  // последние 24 часа
    const last7days = now - 7 * 24 * 60 * 60 * 1000  // последние 7 дней

    const todayPosts = posts.filter(p => new Date(p.created_at || 0).getTime() >= last24h)
    const weekPosts = posts.filter(p => new Date(p.created_at || 0).getTime() >= last7days)
    const trendingCount = posts.filter(p => (p.likes_count || 0) > 0 || (p.views || 0) > 10).length

    return {
      trending: trendingCount,
      thisWeek: weekPosts.length,
      newToday: todayPosts.length
    }
  }, [posts])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56">
          <div className="mx-auto max-w-6xl px-4 py-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">{t.explore.title}</h1>
              <p className="text-muted-foreground">{t.explore.subtitle}</p>
            </div>

            <div className="mb-6">
              <ExploreFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeLanguage={activeLanguage}
                onLanguageChange={setActiveLanguage}
                activeTags={activeTags}
                onTagsChange={setActiveTags}
                activeCategories={activeCategories}
                onCategoriesChange={setActiveCategories}
                activeTime={activeTime}
                onTimeChange={setActiveTime}
                activeSort={activeSort}
                onSortChange={setActiveSort}
                showFilters={showFilters}
                onShowFiltersChange={setShowFilters}
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.trending}</p>
                  <p className="text-xs text-muted-foreground">Trending</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.thisWeek}</p>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.newToday}</p>
                  <p className="text-xs text-muted-foreground">New Today</p>
                </div>
              </div>
            </div>

            {(searchQuery || activeLanguage !== "All" || activeTags.length > 0) && (
              <p className="text-sm text-muted-foreground mb-4">
                Showing {filteredPosts.length} result{filteredPosts.length !== 1 ? "s" : ""}
              </p>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            )}

            {/* Grid */}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post, index) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      featured={index === 0 && filteredPosts.length > 5}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">
                      {posts.length === 0
                        ? "Пока нет постов. Будьте первым!"
                        : "Ничего не найдено. Попробуйте изменить фильтры."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
