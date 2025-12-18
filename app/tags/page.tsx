"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Hash, Search, TrendingUp, Grid3X3, LayoutList, Loader2, ArrowUpDown, Sparkles, Flame, Star, Code, FileCode, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { tagsAPI, postsAPI, type Tag } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"
import Link from "next/link"

// Цвета для тегов
const tagColors: Record<string, { bg: string; dot: string; border: string }> = {
  javascript: { bg: "from-yellow-500/20 to-yellow-600/10", dot: "bg-yellow-400", border: "border-yellow-500/20" },
  typescript: { bg: "from-blue-500/20 to-blue-600/10", dot: "bg-blue-400", border: "border-blue-500/20" },
  python: { bg: "from-green-500/20 to-green-600/10", dot: "bg-green-400", border: "border-green-500/20" },
  react: { bg: "from-cyan-500/20 to-cyan-600/10", dot: "bg-cyan-400", border: "border-cyan-500/20" },
  rust: { bg: "from-orange-500/20 to-orange-600/10", dot: "bg-orange-400", border: "border-orange-500/20" },
  go: { bg: "from-sky-500/20 to-sky-600/10", dot: "bg-sky-400", border: "border-sky-500/20" },
  vue: { bg: "from-emerald-500/20 to-emerald-600/10", dot: "bg-emerald-400", border: "border-emerald-500/20" },
  nodejs: { bg: "from-lime-500/20 to-lime-600/10", dot: "bg-lime-400", border: "border-lime-500/20" },
  css: { bg: "from-purple-500/20 to-purple-600/10", dot: "bg-purple-400", border: "border-purple-500/20" },
  docker: { bg: "from-blue-600/20 to-blue-700/10", dot: "bg-blue-300", border: "border-blue-600/20" },
}

const getTagColor = (name: string) => {
  return tagColors[name.toLowerCase()] || { bg: "from-white/5 to-white/[0.02]", dot: "bg-white/40", border: "border-white/[0.06]" }
}

interface TagCardProps {
  tag: Tag
  viewMode: "grid" | "list"
  postsLabel: string
  index: number
}

function TagCard({ tag, viewMode, postsLabel, index }: TagCardProps) {
  const color = getTagColor(tag.name)

  if (viewMode === "list") {
    return (
      <Link href={`/explore?tag=${encodeURIComponent(tag.name)}`}>
        <div
          className={cn(
            "flex items-center justify-between p-4 rounded-xl border bg-[#0c0c0e] transition-all duration-300 group",
            "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
          )}
          style={{ animationDelay: `${index * 30}ms` }}
        >
          <div className="flex items-center gap-4">
            <div className={cn("h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center", color.bg)}>
              <Hash className="h-5 w-5 text-white/60" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-medium text-white/80 group-hover:text-white transition-colors">{tag.name}</h3>
              <p className="text-xs text-white/35">{tag.usage_count || 0} {postsLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", color.dot)} />
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/explore?tag=${encodeURIComponent(tag.name)}`}>
      <div
        className={cn(
          "p-4 rounded-xl border bg-[#0c0c0e] transition-all duration-300 h-full group cursor-pointer",
          "border-white/[0.04] hover:border-white/[0.08] hover:scale-[1.02]"
        )}
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className={cn("h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center", color.bg)}>
            <Hash className="h-4 w-4 text-white/60" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white/80 truncate group-hover:text-white transition-colors">{tag.name}</h3>
          </div>
          <span className={cn("h-2 w-2 rounded-full shrink-0", color.dot)} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/35">{tag.usage_count || 0} {postsLabel}</span>
          <div className="flex items-center gap-1 text-white/20 group-hover:text-white/40 transition-colors">
            <FileCode className="h-3 w-3" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function TagsPage() {
  const { t } = useLanguage()
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"popular" | "alphabetical">("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [mounted, setMounted] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [stats, setStats] = useState({ totalTags: 0, totalPosts: 0, topTag: "" })

  useEffect(() => {
    setMounted(true)
    const fetchData = async () => {
      try {
        const [tagsData, postsData] = await Promise.all([
          tagsAPI.list(),
          postsAPI.stats()
        ])

        const tagsList = Array.isArray(tagsData) ? tagsData : (tagsData as any).results || []
        setTags(tagsList)

        // Calculate stats
        const sortedTags = [...tagsList].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
        setStats({
          totalTags: tagsList.length,
          totalPosts: postsData.total_posts || 0,
          topTag: sortedTags[0]?.name || "-"
        })
      } catch (err) {
        console.error("Error fetching tags:", err)
        setTags([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredTags = useMemo(() => {
    let result = [...tags]

    if (searchQuery) {
      result = result.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (sortBy === "popular") {
      result.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [tags, searchQuery, sortBy])

  // Top tags для hero секции
  const topTags = useMemo(() => {
    return [...tags].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0)).slice(0, 5)
  }, [tags])

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-white/[0.008] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/[0.008] rounded-full blur-[150px]" />
      </div>

      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56 relative z-10">
          <div className="mx-auto max-w-6xl px-4 py-6">

            {/* Header */}
            <div className={cn(
              "mb-8 transition-all duration-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            )}>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <Hash className="h-5 w-5 text-white/50" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white/90">{t.tags.title}</h1>
                  <p className="text-sm text-white/40">{t.tags.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className={cn(
              "grid grid-cols-3 gap-4 mb-6 transition-all duration-500 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10">
                    <Hash className="h-5 w-5 text-purple-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white/80 group-hover:text-white transition-colors">{stats.totalTags}</p>
                    <p className="text-xs text-white/35">{t.pages.tags.totalTags}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10">
                    <Code className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white/80 group-hover:text-white transition-colors">{stats.totalPosts}</p>
                    <p className="text-xs text-white/35">{t.pages.tags.totalPosts}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/10">
                    <Flame className="h-5 w-5 text-orange-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white/80 group-hover:text-white transition-colors">#{stats.topTag}</p>
                    <p className="text-xs text-white/35">{t.pages.tags.topTag}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Tags */}
            {!isLoading && topTags.length > 0 && (
              <div className={cn(
                "mb-8 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] transition-all duration-500 delay-200",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-white/40" strokeWidth={1.5} />
                  <h3 className="text-sm font-medium text-white/60">{t.pages.tags.popularTags}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topTags.map((tag, i) => {
                    const color = getTagColor(tag.name)
                    return (
                      <Link key={tag.id} href={`/explore?tag=${encodeURIComponent(tag.name)}`}>
                        <div
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br border transition-all duration-300 hover:scale-105 cursor-pointer",
                            color.bg, color.border
                          )}
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          <span className={cn("h-2 w-2 rounded-full", color.dot)} />
                          <span className="text-sm font-medium text-white/70">#{tag.name}</span>
                          <span className="text-xs text-white/30">{tag.usage_count}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className={cn(
              "flex flex-col sm:flex-row gap-4 mb-6 transition-all duration-500 delay-300",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <div className={cn(
                "relative flex-1 rounded-xl transition-all duration-200",
                isFocused && "ring-1 ring-white/[0.12]"
              )}>
                <Search className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                  isFocused ? "text-white/50" : "text-white/25"
                )} strokeWidth={1.5} />
                <Input
                  placeholder={t.tags.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="h-10 pl-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.1] focus-visible:ring-0 rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy("popular")}
                  className={cn(
                    "gap-1.5 h-10 rounded-xl border-white/[0.06] transition-all",
                    sortBy === "popular"
                      ? "bg-white/[0.08] text-white/80 border-white/[0.12]"
                      : "bg-white/[0.02] text-white/40 hover:bg-white/[0.05] hover:text-white/60"
                  )}
                >
                  <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
                  {t.tags.popular}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy("alphabetical")}
                  className={cn(
                    "gap-1.5 h-10 rounded-xl border-white/[0.06] transition-all",
                    sortBy === "alphabetical"
                      ? "bg-white/[0.08] text-white/80 border-white/[0.12]"
                      : "bg-white/[0.02] text-white/40 hover:bg-white/[0.05] hover:text-white/60"
                  )}
                >
                  <ArrowUpDown className="h-4 w-4" strokeWidth={1.5} />
                  {t.tags.alphabetical}
                </Button>
                <div className="border-l border-white/[0.06] ml-2 pl-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "h-10 w-10 rounded-xl transition-all",
                      viewMode === "grid"
                        ? "bg-white/[0.08] text-white/70"
                        : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "h-10 w-10 rounded-xl transition-all",
                      viewMode === "list"
                        ? "bg-white/[0.08] text-white/70"
                        : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                    )}
                  >
                    <LayoutList className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Search Results Count */}
            {searchQuery && (
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-white/30" strokeWidth={1.5} />
                <p className="text-sm text-white/40">
                  {t.pages.tags.found}: <span className="text-white/60 font-medium">{filteredTags.length}</span>
                </p>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                  <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                </div>
                <p className="text-sm text-white/30">{t.pages.tags.loadingTags}</p>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && filteredTags.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
                  <Hash className="h-7 w-7 text-white/30" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium text-white/60 mb-2">{t.common.noResults}</h3>
                <p className="text-sm text-white/30 max-w-xs">
                  Попробуйте изменить поисковый запрос
                </p>
              </div>
            )}

            {/* Tags Grid/List */}
            {!isLoading && filteredTags.length > 0 && (
              <div className={cn(
                "transition-all duration-500 delay-400",
                mounted ? "opacity-100" : "opacity-0",
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                  : "flex flex-col gap-3"
              )}>
                {filteredTags.map((tag, index) => (
                  <TagCard
                    key={tag.id}
                    tag={tag}
                    viewMode={viewMode}
                    postsLabel={t.tags.postsCount}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
