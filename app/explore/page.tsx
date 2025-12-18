"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { ExploreFilters } from "@/components/explore-filters"
import { TrendingUp, Flame, Clock, Heart, MessageSquare, Eye, Loader2, Compass, Search, Sparkles, FileCode } from "lucide-react"
import { postsAPI, tagsAPI } from "@/lib/api"
import type { Post, Tag } from "@/lib/api"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"

// Цвета языков
const languageColors: Record<string, { bg: string; dot: string; text: string }> = {
  javascript: { bg: "bg-yellow-500/10", dot: "bg-yellow-400", text: "text-yellow-400/80" },
  typescript: { bg: "bg-blue-500/10", dot: "bg-blue-400", text: "text-blue-400/80" },
  python: { bg: "bg-green-500/10", dot: "bg-green-400", text: "text-green-400/80" },
  rust: { bg: "bg-orange-500/10", dot: "bg-orange-400", text: "text-orange-400/80" },
  go: { bg: "bg-cyan-500/10", dot: "bg-cyan-400", text: "text-cyan-400/80" },
  java: { bg: "bg-red-500/10", dot: "bg-red-400", text: "text-red-400/80" },
  csharp: { bg: "bg-purple-500/10", dot: "bg-purple-400", text: "text-purple-400/80" },
  cpp: { bg: "bg-pink-500/10", dot: "bg-pink-400", text: "text-pink-400/80" },
}

interface PostCardProps {
  post: Post
  index: number
  noDescription: string
}

function PostCard({ post, index, noDescription }: PostCardProps) {
  const langColor = languageColors[post.language?.toLowerCase() || ""] || { bg: "bg-white/5", dot: "bg-white/40", text: "text-white/50" }
  const tags = post.tags?.map((tag: Tag) => tag.name) || []

  return (
    <Link href={`/post/${post.id}`} className="block group">
      <article
        className={cn(
          "h-full rounded-2xl border bg-[#0c0c0e] p-4 transition-all duration-300",
          "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
        )}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
              <FileCode className="h-4 w-4 text-white/40" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-white/80 truncate group-hover:text-white transition-colors">
                {post.filename || post.title}
              </h3>
              <p className="text-[11px] text-white/30">@{post.author?.username}</p>
            </div>
          </div>
          <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-md shrink-0", langColor.bg)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", langColor.dot)} />
            <span className={cn("font-mono text-[10px]", langColor.text)}>{post.language}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-white/40 mb-3 line-clamp-2">
          {post.description || noDescription}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[10px] text-white/35">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5 border border-white/[0.06]">
              <AvatarImage src={post.author?.avatar || "/developer-avatar.png"} />
              <AvatarFallback className="bg-white/[0.04] text-white/40 text-[8px]">
                {post.author?.display_name?.[0] || post.author?.username?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] text-white/30 truncate max-w-[80px]">
              {post.author?.display_name || post.author?.username}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-white/30">
            <span className="flex items-center gap-1">
              <Heart className={cn("h-3 w-3", post.is_liked && "fill-rose-400 text-rose-400")} strokeWidth={1.5} />
              {post.likes_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" strokeWidth={1.5} />
              {post.comments_count}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" strokeWidth={1.5} />
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
  const [mounted, setMounted] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [activeLanguage, setActiveLanguage] = useState("All")
  const [activeTags, setActiveTags] = useState<string[]>(tagFromUrl ? [tagFromUrl] : [])
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const [activeTime, setActiveTime] = useState("This Week")
  const [activeSort, setActiveSort] = useState("Most Likes")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setMounted(true)
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
        setError(t.pages.explore.errorLoading)
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

    if (activeLanguage !== "All") {
      items = items.filter((item) =>
        item.language?.toLowerCase() === activeLanguage.toLowerCase()
      )
    }

    if (activeTags.length > 0) {
      items = items.filter((item) =>
        activeTags.some((tag) =>
          item.tags?.some((t: Tag) => t.name.toLowerCase() === tag.toLowerCase())
        )
      )
    }

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
    }

    return items
  }, [posts, searchQuery, activeLanguage, activeTags, activeSort])

  const stats = useMemo(() => {
    const now = Date.now()
    const last24h = now - 24 * 60 * 60 * 1000
    const last7days = now - 7 * 24 * 60 * 60 * 1000

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
    <div className="min-h-screen bg-[#09090b]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-white/[0.008] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-white/[0.008] rounded-full blur-[150px]" />
      </div>

      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56 relative z-10">
          <div className="mx-auto max-w-6xl px-4 py-6">
            {/* Header */}
            <div className={cn(
              "mb-6 transition-all duration-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            )}>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <Compass className="h-5 w-5 text-white/50" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white/90">{t.explore.title}</h1>
                  <p className="text-sm text-white/40">{t.explore.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className={cn(
              "mb-6 transition-all duration-500 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
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
            <div className={cn(
              "grid grid-cols-3 gap-4 mb-6 transition-all duration-500 delay-200",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              {[
                { icon: Flame, value: stats.trending, label: "Trending", color: "from-orange-500/20 to-red-500/10", iconColor: "text-orange-400" },
                { icon: TrendingUp, value: stats.thisWeek, label: t.pages.explore.thisWeek, color: "from-green-500/20 to-emerald-500/10", iconColor: "text-green-400" },
                { icon: Clock, value: stats.newToday, label: t.pages.explore.today, color: "from-blue-500/20 to-cyan-500/10", iconColor: "text-blue-400" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group cursor-default"
                >
                  <div className={cn("p-2.5 rounded-xl bg-gradient-to-br", stat.color)}>
                    <stat.icon className={cn("h-5 w-5", stat.iconColor)} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white/80 group-hover:text-white transition-colors">{stat.value}</p>
                    <p className="text-xs text-white/35">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Results count */}
            {(searchQuery || activeLanguage !== "All" || activeTags.length > 0) && (
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-white/30" strokeWidth={1.5} />
                <p className="text-sm text-white/40">
                  {t.pages.explore.found}: <span className="text-white/60 font-medium">{filteredPosts.length}</span>
                </p>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                  <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                </div>
                <p className="text-sm text-white/30">{t.pages.explore.loading}</p>
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Grid */}
            {!isLoading && !error && (
              <div className={cn(
                "transition-all duration-500 delay-300",
                mounted ? "opacity-100" : "opacity-0"
              )}>
                {filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPosts.map((post, index) => (
                      <PostCard key={post.id} post={post} index={index} noDescription={t.pages.explore.noDescription} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
                      <Sparkles className="h-7 w-7 text-white/30" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-medium text-white/60 mb-2">{t.pages.explore.nothingFound}</h3>
                    <p className="text-sm text-white/30 max-w-xs">
                      {posts.length === 0
                        ? t.pages.explore.noPosts
                        : t.pages.explore.tryChangeFilters}
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
