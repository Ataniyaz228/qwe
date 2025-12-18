"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Grid3X3, List, Bookmark, Loader2, Heart, MessageSquare, Eye, Trash2, FileCode, Compass, FolderHeart, Clock, Sparkles } from "lucide-react"
import { postsAPI } from "@/lib/api"
import type { Post, Tag } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"

// Цвета языков
const languageColors: Record<string, { bg: string; dot: string }> = {
  javascript: { bg: "from-yellow-500/20 to-yellow-600/10", dot: "bg-yellow-400" },
  typescript: { bg: "from-blue-500/20 to-blue-600/10", dot: "bg-blue-400" },
  python: { bg: "from-green-500/20 to-green-600/10", dot: "bg-green-400" },
  rust: { bg: "from-orange-500/20 to-orange-600/10", dot: "bg-orange-400" },
  go: { bg: "from-cyan-500/20 to-cyan-600/10", dot: "bg-cyan-400" },
  java: { bg: "from-red-500/20 to-red-600/10", dot: "bg-red-400" },
  csharp: { bg: "from-purple-500/20 to-purple-600/10", dot: "bg-purple-400" },
  cpp: { bg: "from-pink-500/20 to-pink-600/10", dot: "bg-pink-400" },
}

interface BookmarkCardProps {
  post: Post
  viewMode: "grid" | "list"
  onRemove: () => void
  index: number
  translations: {
    removed: string
    error: string
    noDescription: string
  }
}

function BookmarkCard({ post, viewMode, onRemove, index, translations }: BookmarkCardProps) {
  const color = languageColors[post.language?.toLowerCase() || ""] || { bg: "from-white/5 to-white/[0.02]", dot: "bg-white/40" }
  const tags = post.tags?.map((tag: Tag) => tag.name) || []

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await postsAPI.unbookmark(post.id)
      onRemove()
      toast.success(translations.removed)
    } catch {
      toast.error(translations.error)
    }
  }

  if (viewMode === "list") {
    return (
      <Link href={`/post/${post.id}`}>
        <div
          className={cn(
            "flex items-center justify-between p-4 rounded-xl border bg-[#0c0c0e] transition-all duration-300 group",
            "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
          )}
          style={{ animationDelay: `${index * 30}ms` }}
        >
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className={cn("h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0", color.bg)}>
              <FileCode className="h-5 w-5 text-white/50" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-white/80 truncate group-hover:text-white transition-colors">
                {post.filename || post.title}
              </h3>
              <p className="text-xs text-white/35 truncate">{post.description || "Нет описания"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center gap-3 text-[10px] text-white/30">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" strokeWidth={1.5} />
                {post.likes_count}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" strokeWidth={1.5} />
                {post.comments_count}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/post/${post.id}`}>
      <div
        className={cn(
          "group rounded-xl border bg-[#0c0c0e] p-4 transition-all duration-300 h-full relative",
          "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
        )}
        style={{ animationDelay: `${index * 30}ms` }}
      >
        {/* Remove button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-7 w-7 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
          onClick={handleRemove}
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-3 pr-8">
          <div className={cn("h-9 w-9 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0", color.bg)}>
            <FileCode className="h-4 w-4 text-white/50" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-white/80 truncate group-hover:text-white transition-colors">
              {post.filename || post.title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", color.dot)} />
              <span className="text-[10px] text-white/35 font-mono">{post.language}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-white/35 mb-3 line-clamp-2">{post.description || translations.noDescription}</p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[10px] text-white/30">
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

          <div className="flex items-center gap-3 text-[10px] text-white/25">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" strokeWidth={1.5} />
              {post.likes_count}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" strokeWidth={1.5} />
              {post.views}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function BookmarksPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { t } = useLanguage()

  const [bookmarks, setBookmarks] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [filterLanguage, setFilterLanguage] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    setMounted(true)

    if (authLoading) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchBookmarks = async () => {
      setIsLoading(true)
      try {
        const data = await postsAPI.bookmarks()
        setBookmarks(data.results || [])
      } catch (err) {
        console.error("Error fetching bookmarks:", err)
        setError(t.bookmarks.loadError)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBookmarks()
  }, [isAuthenticated, authLoading, router])

  const handleRemoveBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }

  const filteredBookmarks = useMemo(() => {
    return bookmarks
      .filter((b) => {
        const matchesSearch =
          b.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.tags?.some((t: Tag) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesLanguage = filterLanguage === "all" ||
          b.language?.toLowerCase() === filterLanguage.toLowerCase()
        return matchesSearch && matchesLanguage
      })
      .sort((a, b) => {
        if (sortBy === "likes") return (b.likes_count || 0) - (a.likes_count || 0)
        if (sortBy === "title") return (a.filename || "").localeCompare(b.filename || "")
        return 0
      })
  }, [bookmarks, searchQuery, filterLanguage, sortBy])

  const languages = useMemo(() => {
    return [...new Set(bookmarks.map((b) => b.language).filter(Boolean))]
  }, [bookmarks])

  // Stats
  const stats = useMemo(() => {
    const totalLikes = bookmarks.reduce((sum, b) => sum + (b.likes_count || 0), 0)
    const langCounts = bookmarks.reduce((acc, b) => {
      if (b.language) acc[b.language] = (acc[b.language] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const topLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-"

    return { total: bookmarks.length, totalLikes, topLang }
  }, [bookmarks])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-white/40" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-[600px] h-[600px] bg-white/[0.008] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-white/[0.008] rounded-full blur-[150px]" />
      </div>

      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56 relative z-10">
          <div className="max-w-6xl px-4 py-6">

            {/* Header */}
            <div className={cn(
              "mb-6 transition-all duration-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            )}>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <Bookmark className="h-5 w-5 text-white/50" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white/90">{t.bookmarks.title}</h1>
                  <p className="text-sm text-white/40">{bookmarks.length} {t.bookmarks.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                  <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                </div>
                <p className="text-sm text-white/30">{t.bookmarks.loading}</p>
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

            {/* Empty State */}
            {!isLoading && !error && bookmarks.length === 0 && (
              <div className={cn(
                "flex flex-col items-center justify-center py-20 text-center transition-all duration-500",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <div className="h-16 w-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
                  <FolderHeart className="h-7 w-7 text-white/30" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-medium text-white/70 mb-2">{t.bookmarks.empty}</h2>
                <p className="text-sm text-white/35 mb-6 max-w-xs">
                  {t.bookmarks.emptySubtitle}
                </p>
                <Button
                  onClick={() => router.push("/explore")}
                  className="gap-2 bg-white text-black hover:bg-white/90 rounded-xl font-medium"
                >
                  <Compass className="h-4 w-4" strokeWidth={2} />
                  {t.bookmarks.explore}
                </Button>
              </div>
            )}

            {/* Content */}
            {!isLoading && !error && bookmarks.length > 0 && (
              <>
                {/* Stats */}
                <div className={cn(
                  "grid grid-cols-3 gap-4 mb-6 transition-all duration-500 delay-100",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}>
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10">
                        <Bookmark className="h-5 w-5 text-yellow-400" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white/80 group-hover:text-white transition-colors">{stats.total}</p>
                        <p className="text-xs text-white/35">{t.bookmarks.bookmarksCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/10">
                        <Heart className="h-5 w-5 text-rose-400" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white/80 group-hover:text-white transition-colors">{stats.totalLikes}</p>
                        <p className="text-xs text-white/35">{t.bookmarks.likesCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10">
                        <Sparkles className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white/80 group-hover:text-white transition-colors">{stats.topLang}</p>
                        <p className="text-xs text-white/35">{t.bookmarks.topLanguage}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className={cn(
                  "flex flex-wrap items-center gap-3 mb-6 transition-all duration-500 delay-200",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}>
                  <div className={cn(
                    "relative flex-1 min-w-[200px] max-w-md rounded-xl transition-all duration-200",
                    isFocused && "ring-1 ring-white/[0.12]"
                  )}>
                    <Search className={cn(
                      "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
                      isFocused ? "text-white/50" : "text-white/25"
                    )} strokeWidth={1.5} />
                    <Input
                      placeholder={t.bookmarks.searchPlaceholder}
                      className="h-10 pl-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.1] focus-visible:ring-0 rounded-xl"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                    />
                  </div>

                  <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                    <SelectTrigger className="w-[140px] h-10 bg-white/[0.03] border-white/[0.06] text-white/60 rounded-xl">
                      <SelectValue placeholder="Язык" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0c0c0e] border-white/[0.06]">
                      <SelectItem value="all">{t.bookmarks.allLanguages}</SelectItem>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang!.toLowerCase()}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px] h-10 bg-white/[0.03] border-white/[0.06] text-white/60 rounded-xl">
                      <Clock className="h-4 w-4 mr-2 text-white/30" strokeWidth={1.5} />
                      <SelectValue placeholder="Сортировка" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0c0c0e] border-white/[0.06]">
                      <SelectItem value="recent">{t.bookmarks.byDate}</SelectItem>
                      <SelectItem value="likes">{t.bookmarks.byLikes}</SelectItem>
                      <SelectItem value="title">{t.bookmarks.byTitle}</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1 ml-auto border-l border-white/[0.06] pl-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-xl transition-all",
                        viewMode === "grid"
                          ? "bg-white/[0.08] text-white/70"
                          : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                      )}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-xl transition-all",
                        viewMode === "list"
                          ? "bg-white/[0.08] text-white/70"
                          : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                      )}
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                  </div>
                </div>

                {/* Search Results Count */}
                {searchQuery && (
                  <div className="flex items-center gap-2 mb-4">
                    <Search className="h-4 w-4 text-white/30" strokeWidth={1.5} />
                    <p className="text-sm text-white/40">
                      {t.bookmarks.found}: <span className="text-white/60 font-medium">{filteredBookmarks.length}</span>
                    </p>
                  </div>
                )}

                {/* Results */}
                {filteredBookmarks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                      <Search className="h-5 w-5 text-white/30" strokeWidth={1.5} />
                    </div>
                    <p className="text-white/40">{t.bookmarks.nothingFound}</p>
                  </div>
                ) : (
                  <div className={cn(
                    "transition-all duration-500 delay-300",
                    mounted ? "opacity-100" : "opacity-0",
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      : "flex flex-col gap-3"
                  )}>
                    {filteredBookmarks.map((bookmark, index) => (
                      <BookmarkCard
                        key={bookmark.id}
                        post={bookmark}
                        viewMode={viewMode}
                        onRemove={() => handleRemoveBookmark(bookmark.id)}
                        index={index}
                        translations={{
                          removed: t.bookmarks.removed,
                          error: t.bookmarks.error,
                          noDescription: t.bookmarks.noDescription
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
