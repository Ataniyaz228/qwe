"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, Grid3X3, List, Bookmark, Loader2, Heart, MessageSquare, Eye, Trash2 } from "lucide-react"
import { postsAPI } from "@/lib/api"
import type { Post, Tag } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
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
}

interface BookmarkCardProps {
  post: Post
  viewMode: "grid" | "list"
  onRemove: () => void
}

function BookmarkCard({ post, viewMode, onRemove }: BookmarkCardProps) {
  const langColor = languageColors[post.language?.toLowerCase() || ""] || "bg-gray-500"
  const tags = post.tags?.map((t: Tag) => t.name) || []

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await postsAPI.unbookmark(post.id)
      onRemove()
      toast.success("Убрано из закладок")
    } catch {
      toast.error("Ошибка")
    }
  }

  if (viewMode === "list") {
    return (
      <Link href={`/post/${post.id}`}>
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all cursor-pointer group">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className={cn("h-3 w-3 rounded-full shrink-0", langColor)} />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {post.filename || post.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {post.description || "Нет описания"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {post.likes_count}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {post.comments_count}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-red-500"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/post/${post.id}`}>
      <div className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer h-full relative">
        {/* Remove button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-3 pr-8">
          <div className={cn("h-3 w-3 rounded-full shrink-0 mt-1.5", langColor)} />
          <div className="min-w-0">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {post.filename || post.title}
            </h3>
            {post.language && (
              <Badge variant="secondary" className="font-mono text-xs mt-1">
                {post.language}
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {post.description || "Нет описания"}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal px-2 py-0">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author?.avatar || "/developer-avatar.png"} />
              <AvatarFallback className="text-xs">
                {post.author?.display_name?.[0] || post.author?.username?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
              {post.author?.display_name || post.author?.username}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {post.likes_count}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
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

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [filterLanguage, setFilterLanguage] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Загрузка закладок
  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    const fetchBookmarks = async () => {
      setIsLoading(true)
      try {
        const data = await postsAPI.bookmarks()
        setBookmarks(data.results || [])
      } catch (err) {
        console.error("Error fetching bookmarks:", err)
        setError("Ошибка загрузки закладок")
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
        return 0 // recent - keep original order
      })
  }, [bookmarks, searchQuery, filterLanguage, sortBy])

  const languages = useMemo(() => {
    return [...new Set(bookmarks.map((b) => b.language).filter(Boolean))]
  }, [bookmarks])

  // Показываем загрузку пока проверяем авторизацию
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56">
          <div className="mx-auto max-w-5xl px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  <Bookmark className="h-6 w-6 text-primary" />
                  {t.bookmarks.title}
                </h1>
                <p className="text-muted-foreground">
                  {bookmarks.length} {t.bookmarks.subtitle}
                </p>
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

            {/* Empty State */}
            {!isLoading && !error && bookmarks.length === 0 && (
              <div className="text-center py-16">
                <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Нет закладок</h2>
                <p className="text-muted-foreground mb-4">
                  Сохраняйте интересные сниппеты, чтобы вернуться к ним позже
                </p>
                <Button onClick={() => router.push("/explore")}>
                  Найти сниппеты
                </Button>
              </div>
            )}

            {/* Content */}
            {!isLoading && !error && bookmarks.length > 0 && (
              <>
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Поиск закладок..."
                      className="pl-9 bg-card border-border"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                    <SelectTrigger className="w-[140px] bg-card border-border">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Язык" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все языки</SelectItem>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang!.toLowerCase()}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px] bg-card border-border">
                      <SelectValue placeholder="Сортировка" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">По дате</SelectItem>
                      <SelectItem value="likes">По лайкам</SelectItem>
                      <SelectItem value="title">По названию</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1 ml-auto">
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Results */}
                {filteredBookmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Ничего не найдено</p>
                  </div>
                ) : (
                  <div
                    className={viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                      : "flex flex-col gap-3"}
                  >
                    {filteredBookmarks.map((bookmark) => (
                      <BookmarkCard
                        key={bookmark.id}
                        post={bookmark}
                        viewMode={viewMode}
                        onRemove={() => handleRemoveBookmark(bookmark.id)}
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
