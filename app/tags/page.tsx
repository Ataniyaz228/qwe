"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Hash, Search, TrendingUp, Grid3X3, LayoutList, Loader2, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { tagsAPI, type Tag } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"
import Link from "next/link"

// Цвета для тегов
const getTagColor = (name: string): string => {
  const colors: Record<string, string> = {
    javascript: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    typescript: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    python: "bg-green-500/20 text-green-400 border-green-500/30",
    react: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    rust: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    go: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    vue: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    nodejs: "bg-lime-500/20 text-lime-400 border-lime-500/30",
    css: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    html: "bg-orange-600/20 text-orange-400 border-orange-600/30",
    sql: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    docker: "bg-blue-600/20 text-blue-300 border-blue-600/30",
  }
  return colors[name.toLowerCase()] || "bg-primary/10 text-primary border-primary/30"
}

interface TagCardProps {
  tag: Tag
  viewMode: "grid" | "list"
  postsLabel: string
}

function TagCard({ tag, viewMode, postsLabel }: TagCardProps) {
  const colorClass = getTagColor(tag.name)

  if (viewMode === "list") {
    return (
      <Link href={`/explore?tag=${encodeURIComponent(tag.name)}`}>
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", colorClass)}>
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{tag.name}</h3>
              <p className="text-sm text-muted-foreground">{tag.usage_count || 0} {postsLabel}</p>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/explore?tag=${encodeURIComponent(tag.name)}`}>
      <div className={cn(
        "p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all cursor-pointer h-full",
        colorClass
      )}>
        <div className="flex items-center gap-2 mb-2">
          <Hash className="h-5 w-5" />
          <h3 className="font-semibold">{tag.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{tag.usage_count || 0} {postsLabel}</p>
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

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await tagsAPI.list()
        // Handle both array and paginated response
        if (Array.isArray(data)) {
          setTags(data)
        } else if (data && typeof data === 'object' && 'results' in data) {
          setTags((data as any).results || [])
        } else {
          setTags([])
        }
      } catch (err) {
        console.error("Error fetching tags:", err)
        setTags([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchTags()
  }, [])

  const filteredTags = useMemo(() => {
    let result = [...tags]

    // Filter by search
    if (searchQuery) {
      result = result.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    if (sortBy === "popular") {
      result.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [tags, searchQuery, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56">
          <div className="mx-auto max-w-6xl px-4 py-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <Hash className="h-6 w-6 text-primary" />
                {t.tags.title}
              </h1>
              <p className="text-muted-foreground">{t.tags.subtitle}</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.tags.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "popular" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("popular")}
                  className="gap-1.5"
                >
                  <TrendingUp className="h-4 w-4" />
                  {t.tags.popular}
                </Button>
                <Button
                  variant={sortBy === "alphabetical" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("alphabetical")}
                  className="gap-1.5"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {t.tags.alphabetical}
                </Button>
                <div className="border-l border-border ml-2 pl-2 flex gap-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Empty state */}
            {!isLoading && filteredTags.length === 0 && (
              <div className="text-center py-12">
                <Hash className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">{t.common.noResults}</h3>
              </div>
            )}

            {/* Tags Grid/List */}
            {!isLoading && filteredTags.length > 0 && (
              <div className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                  : "flex flex-col gap-3"
              )}>
                {filteredTags.map((tag) => (
                  <TagCard
                    key={tag.id}
                    tag={tag}
                    viewMode={viewMode}
                    postsLabel={t.tags.postsCount}
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
