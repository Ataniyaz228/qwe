"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TrendingUp, Star, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { postsAPI, usersAPI, type Post, type User } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"
import { AiAssistantWidget } from "@/components/ai-assistant-widget"

export function Widgets() {
  const { t } = useLanguage()
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([])
  const [topContributors, setTopContributors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [trending, contributors] = await Promise.all([
        postsAPI.trending(),
        usersAPI.topContributors()
      ])
      // Обработка разных форматов ответа API
      const trendingArray = Array.isArray(trending) ? trending : (trending.results || [])
      const contributorsArray = Array.isArray(contributors) ? contributors : (contributors.results || [])

      setTrendingPosts(trendingArray.slice(0, 3))
      setTopContributors(contributorsArray.slice(0, 5))
    } catch (err) {
      console.error("Error loading widgets:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatStars = (count: number): string => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
    return count.toString()
  }

  return (
    <aside className="hidden xl:block w-72 shrink-0">
      <div className="sticky top-[4.5rem] flex flex-col gap-4">
        {/* Trending Repos */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">{t.widgets.trendingNow}</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : trendingPosts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              {t.common.noResults}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {trendingPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="flex items-center justify-between hover:bg-secondary/50 -mx-2 px-2 py-1.5 rounded-md transition-colors"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-primary truncate">
                      {post.filename || post.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      @{post.author?.username || 'anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="h-3.5 w-3.5 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{formatStars(post.likes_count || 0)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Contributors */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-semibold text-sm mb-4">{t.widgets.topContributors}</h3>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : topContributors.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              {t.common.noResults}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {topContributors.map((contributor, index) => (
                <Link
                  key={contributor.username}
                  href={`/user/${contributor.username}`}
                  className="flex items-center gap-3 hover:bg-secondary/50 -mx-2 px-2 py-1.5 rounded-md transition-colors"
                >
                  <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={contributor.avatar || "/developer-avatar.png"} />
                    <AvatarFallback>
                      {(contributor.display_name || contributor.username)?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {contributor.display_name || contributor.username}
                    </span>
                    <span className="text-xs text-muted-foreground">@{contributor.username}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {(contributor as any).posts_count || 0} {t.common.posts.toLowerCase()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* AI Assistant */}
        <AiAssistantWidget />
      </div>
    </aside>
  )
}
