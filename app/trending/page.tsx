"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Search,
  Flame,
  Clock,
  Calendar,
  CalendarDays,
  ArrowUpDown,
  TrendingUp,
  Heart,
  MessageSquare,
  Eye,
  Loader2,
  Zap,
  Trophy,
  Star,
  FileCode,
  Crown,
  Medal,
  Award,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { postsAPI } from "@/lib/api"
import type { Post, Tag } from "@/lib/api"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const defaultLanguages = ["All", "JavaScript", "Python", "TypeScript", "Go", "Rust", "CSS", "Java"]

const languageColors: Record<string, { bg: string; dot: string }> = {
  javascript: { bg: "from-yellow-500/20 to-yellow-600/10", dot: "bg-yellow-400" },
  typescript: { bg: "from-blue-500/20 to-blue-600/10", dot: "bg-blue-400" },
  python: { bg: "from-green-500/20 to-green-600/10", dot: "bg-green-400" },
  rust: { bg: "from-orange-500/20 to-orange-600/10", dot: "bg-orange-400" },
  go: { bg: "from-cyan-500/20 to-cyan-600/10", dot: "bg-cyan-400" },
  java: { bg: "from-red-500/20 to-red-600/10", dot: "bg-red-400" },
  csharp: { bg: "from-purple-500/20 to-purple-600/10", dot: "bg-purple-400" },
  css: { bg: "from-purple-500/20 to-purple-600/10", dot: "bg-purple-400" },
}

interface TrendingCardProps {
  post: Post
  rank: number
  index: number
}

function TrendingCard({ post, rank, index }: TrendingCardProps) {
  const color = languageColors[post.language?.toLowerCase() || ""] || { bg: "from-white/5 to-white/[0.02]", dot: "bg-white/40" }
  const tags = post.tags?.map((t: Tag) => t.name) || []
  const isHot = (post.likes_count || 0) > 5 || (post.views || 0) > 50

  const RankIcon = rank === 1 ? Crown : rank === 2 ? Medal : rank === 3 ? Award : null
  const rankColors = {
    1: { bg: "from-yellow-500/30 to-amber-600/20", text: "text-yellow-400", border: "border-yellow-500/30" },
    2: { bg: "from-slate-400/30 to-gray-500/20", text: "text-slate-300", border: "border-slate-400/30" },
    3: { bg: "from-orange-600/30 to-amber-700/20", text: "text-orange-400", border: "border-orange-600/30" },
  }
  const rankStyle = rankColors[rank as 1 | 2 | 3] || { bg: "from-white/5 to-white/[0.02]", text: "text-white/40", border: "border-white/[0.06]" }

  return (
    <Link href={`/post/${post.id}`}>
      <div
        className={cn(
          "group relative flex items-start gap-4 p-4 rounded-2xl border bg-[#0c0c0e] transition-all duration-300",
          "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]",
          rank <= 3 && "hover:scale-[1.01]"
        )}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Rank Badge */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className={cn(
            "h-12 w-12 rounded-xl bg-gradient-to-br border flex items-center justify-center transition-all duration-300",
            rankStyle.bg, rankStyle.border,
            rank <= 3 && "group-hover:scale-110"
          )}>
            {RankIcon ? (
              <RankIcon className={cn("h-5 w-5", rankStyle.text)} strokeWidth={1.5} />
            ) : (
              <span className={cn("text-lg font-bold", rankStyle.text)}>#{rank}</span>
            )}
          </div>
          {isHot && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 animate-pulse">
              <Flame className="h-3 w-3 text-orange-400" strokeWidth={2} />
              <span className="text-[9px] font-bold text-orange-400">HOT</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-white/80 truncate group-hover:text-white transition-colors">
                {post.filename || post.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("h-2 w-2 rounded-full", color.dot)} />
                <span className="text-xs text-white/35 font-mono">{post.language || "Unknown"}</span>
              </div>
            </div>
            <div className={cn("h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", color.bg)}>
              <FileCode className="h-4 w-4 text-white/50" strokeWidth={1.5} />
            </div>
          </div>

          <p className="text-xs text-white/35 line-clamp-2 mb-3">
            {post.description || "Нет описания"}
          </p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.slice(0, 4).map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[10px] text-white/30 hover:bg-white/[0.06] hover:text-white/50 transition-colors">
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
                  {post.author?.username?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] text-white/35">
                {post.author?.display_name || post.author?.username}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-white/30">
              <span className="flex items-center gap-1 group-hover:text-rose-400 transition-colors">
                <Heart className={cn("h-3.5 w-3.5", post.is_liked && "fill-rose-400 text-rose-400")} strokeWidth={1.5} />
                {post.likes_count}
              </span>
              <span className="flex items-center gap-1 group-hover:text-blue-400 transition-colors">
                <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                {post.comments_count}
              </span>
              <span className="flex items-center gap-1 group-hover:text-white/60 transition-colors">
                <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                {post.views}
              </span>
            </div>
          </div>
        </div>

        {/* Glow effect for top 3 */}
        {rank <= 3 && (
          <div className={cn(
            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
            rank === 1 && "shadow-[0_0_40px_rgba(234,179,8,0.15)]",
            rank === 2 && "shadow-[0_0_30px_rgba(148,163,184,0.1)]",
            rank === 3 && "shadow-[0_0_30px_rgba(234,88,12,0.1)]"
          )} />
        )}
      </div>
    </Link>
  )
}

export default function TrendingPage() {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true)
      try {
        const period = activeTime as 'today' | 'week' | 'month'
        const data = await postsAPI.trending(period)
        setPosts(Array.isArray(data) ? data : (data as unknown as { results: Post[] }).results || [])
      } catch (err) {
        console.error("Error fetching trending:", err)
        setError(t.pages.trending.loadError)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTrending()
  }, [activeTime])

  const languages = useMemo(() => {
    const unique = new Set(posts.map(p => p.language).filter(Boolean))
    return ["All", ...Array.from(unique)]
  }, [posts])

  const filteredAndSortedPosts = useMemo(() => {
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

      const postTime = new Date(post.created_at || 0).getTime()
      let matchesTime = true
      if (activeTime === "today") matchesTime = postTime >= last24h
      else if (activeTime === "week") matchesTime = postTime >= last7days
      else if (activeTime === "month") matchesTime = postTime >= last30days

      return matchesSearch && matchesLanguage && matchesTime
    })

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "likes": return (b.likes_count || 0) - (a.likes_count || 0)
        case "views": return (b.views || 0) - (a.views || 0)
        case "comments": return (b.comments_count || 0) - (a.comments_count || 0)
        default: return 0
      }
    })

    return filtered
  }, [posts, searchQuery, activeLanguage, activeTime, sortBy])

  // Stats
  const stats = useMemo(() => {
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0)
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0)
    const hotCount = posts.filter(p => (p.likes_count || 0) > 5 || (p.views || 0) > 50).length
    return { totalLikes, totalViews, hotCount, total: posts.length }
  }, [posts])

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-500/[0.03] rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-yellow-500/[0.03] rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-red-500/[0.02] rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      <Navbar />
      <Sidebar />

      <main className="pt-5 md:pl-16 lg:pl-56 relative z-10">
        <div className="max-w-5xl px-6 md:px-8 lg:px-10 py-6">

          {/* Header */}
          <div className={cn(
            "mb-8 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-red-600/20 border border-orange-500/30 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-400" strokeWidth={1.5} />
                </div>
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-orange-500 animate-ping" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white/90">{t.trending.title}</h1>
                <p className="text-sm text-white/40">{t.trending.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className={cn(
            "grid grid-cols-4 gap-4 mb-6 transition-all duration-500 delay-100",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            {[
              { icon: Trophy, value: stats.total, label: t.pages.trending.posts, gradient: "from-yellow-500/20 to-amber-600/10", iconColor: "text-yellow-400" },
              { icon: Flame, value: stats.hotCount, label: "HOT", gradient: "from-orange-500/20 to-red-600/10", iconColor: "text-orange-400" },
              { icon: Heart, value: stats.totalLikes, label: t.pages.trending.likes, gradient: "from-rose-500/20 to-pink-600/10", iconColor: "text-rose-400" },
              { icon: Eye, value: stats.totalViews, label: t.pages.trending.views, gradient: "from-blue-500/20 to-cyan-600/10", iconColor: "text-blue-400" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-xl bg-gradient-to-br", stat.gradient)}>
                    <stat.icon className={cn("h-5 w-5", stat.iconColor)} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white/80 group-hover:text-white transition-colors">{stat.value}</p>
                    <p className="text-[10px] text-white/35">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className={cn(
            "mb-6 p-4 rounded-2xl border border-white/[0.04] bg-white/[0.02] transition-all duration-500 delay-200",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-green-400" strokeWidth={1.5} />
              <h3 className="text-sm font-medium text-white/70">{t.pages.trending.howItWorks}</h3>
            </div>
            <p className="text-xs text-white/35 leading-relaxed">
              {t.pages.trending.howItWorksDesc}
            </p>
          </div>

          {/* Filters */}
          <div className={cn(
            "space-y-4 mb-6 transition-all duration-500 delay-300",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            {/* Search */}
            <div className={cn(
              "relative rounded-xl transition-all duration-200",
              isFocused && "ring-1 ring-white/[0.12]"
            )}>
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                isFocused ? "text-white/50" : "text-white/25"
              )} strokeWidth={1.5} />
              <Input
                placeholder={t.pages.trending.searchPlaceholder}
                className="h-10 pl-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.1] focus-visible:ring-0 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </div>

            {/* Time + Sort + Language */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Time */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                {timeFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveTime(filter.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                      activeTime === filter.id
                        ? "bg-white/[0.1] text-white/90"
                        : "text-white/40 hover:text-white/60"
                    )}
                  >
                    <filter.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-white/25" strokeWidth={1.5} />
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                      sortBy === option.id
                        ? "bg-white/[0.08] text-white/80"
                        : "text-white/35 hover:text-white/60"
                    )}
                  >
                    <option.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {(languages.length > 1 ? languages : defaultLanguages).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLanguage(lang)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200",
                    activeLanguage === lang
                      ? "bg-white/[0.1] text-white/80 border border-white/[0.12]"
                      : "bg-white/[0.02] text-white/35 border border-white/[0.04] hover:bg-white/[0.05] hover:text-white/60"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/10 border border-orange-500/30 flex items-center justify-center mb-4">
                <Loader2 className="h-5 w-5 animate-spin text-orange-400" />
              </div>
              <p className="text-sm text-white/30">{t.pages.trending.loadingTrends}</p>
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

          {/* Content */}
          {!isLoading && !error && (
            <>
              {/* Results count */}
              {searchQuery && (
                <div className="flex items-center gap-2 mb-4">
                  <Search className="h-4 w-4 text-white/30" strokeWidth={1.5} />
                  <p className="text-sm text-white/40">
                    {t.pages.trending.found}: <span className="text-white/60 font-medium">{filteredAndSortedPosts.length}</span>
                  </p>
                </div>
              )}

              {/* Trending List */}
              <div className={cn(
                "space-y-4 transition-all duration-500 delay-400",
                mounted ? "opacity-100" : "opacity-0"
              )}>
                {filteredAndSortedPosts.map((post, index) => (
                  <TrendingCard key={post.id} post={post} rank={index + 1} index={index} />
                ))}
              </div>

              {filteredAndSortedPosts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/10 border border-orange-500/20 flex items-center justify-center mb-5">
                    <Flame className="h-7 w-7 text-orange-400/50" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-medium text-white/60 mb-2">{t.pages.trending.noTrendingPosts}</h3>
                  <p className="text-sm text-white/30 max-w-xs">
                    {posts.length === 0 ? t.pages.trending.createFirstPost : t.pages.trending.changeFilters}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
