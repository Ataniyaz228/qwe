"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TrendingUp, Star, Loader2, Users, Sparkles, Zap, Code, Terminal, Clock, ArrowUpRight, MessageSquare, Heart, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { postsAPI, usersAPI, type Post, type User } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"
import { AiAssistantWidget } from "@/components/ai-assistant-widget"
import { cn } from "@/lib/utils"

interface PlatformStats {
  total_likes: number
  total_comments: number
  total_views: number
  today_likes: number
  today_comments: number
  total_posts: number
  total_users: number
}

export function Widgets() {
  const { t } = useLanguage()
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([])
  const [topContributors, setTopContributors] = useState<User[]>([])
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [activeQuickAction, setActiveQuickAction] = useState(0)

  useEffect(() => {
    setMounted(true)
    loadData()
    const interval = setInterval(() => {
      setActiveQuickAction(prev => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [trending, contributors, stats] = await Promise.all([
        postsAPI.trending('week', true),
        usersAPI.topContributors(),
        postsAPI.stats()
      ])
      const trendingArray = Array.isArray(trending) ? trending : ((trending as unknown as { results: Post[] }).results || [])
      const contributorsArray = Array.isArray(contributors) ? contributors : ((contributors as unknown as { results: User[] }).results || [])

      setTrendingPosts(trendingArray)
      setTopContributors(contributorsArray.slice(0, 5))
      setPlatformStats(stats)
    } catch (err) {
      console.error("Error loading widgets:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
    return count.toString()
  }

  const quickActions = [
    { icon: Code, label: t.widgets.newSnippet, href: '/new', color: 'from-blue-500/20 to-cyan-500/10' },
    { icon: Terminal, label: t.nav.explore, href: '/explore', color: 'from-purple-500/20 to-pink-500/10' },
    { icon: TrendingUp, label: t.nav.trending, href: '/trending', color: 'from-orange-500/20 to-yellow-500/10' },
    { icon: Users, label: t.widgets.community, href: '/explore', color: 'from-green-500/20 to-emerald-500/10' },
  ]

  const stats = platformStats ? [
    { icon: Heart, value: formatNumber(platformStats.total_likes), label: t.widgets.totalLikes },
    { icon: MessageSquare, value: formatNumber(platformStats.total_comments), label: t.widgets.commentsCount },
    { icon: Eye, value: formatNumber(platformStats.total_views), label: t.widgets.viewsCount },
  ] : []

  return (
    <aside className="hidden xl:block w-80 shrink-0">
      <div className="sticky top-[4.5rem] flex flex-col gap-4">

        {/* Quick Actions */}
        <div className={cn(
          "rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-lg bg-white/[0.04] flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white/50" strokeWidth={1.5} />
            </div>
            <h3 className="font-medium text-sm text-white/70">{t.widgets.quickActions}</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, i) => (
              <Link
                key={action.label}
                href={action.href}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-xl border transition-all duration-300 group",
                  activeQuickAction === i
                    ? "bg-gradient-to-br border-white/[0.1] scale-[1.02]"
                    : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]",
                  activeQuickAction === i && action.color
                )}
              >
                <action.icon className={cn(
                  "h-4 w-4 transition-colors",
                  activeQuickAction === i ? "text-white/70" : "text-white/40 group-hover:text-white/60"
                )} strokeWidth={1.5} />
                <span className={cn(
                  "text-xs font-medium transition-colors",
                  activeQuickAction === i ? "text-white/80" : "text-white/50 group-hover:text-white/70"
                )}>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Stats */}
        <div className={cn(
          "rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all duration-500 delay-100",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative">
              <div className="h-7 w-7 rounded-lg bg-white/[0.04] flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white/50" strokeWidth={1.5} />
              </div>
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500/80 animate-pulse" />
            </div>
            <h3 className="font-medium text-sm text-white/70">{t.widgets.statistics}</h3>
            <span className="ml-auto text-[10px] text-white/30 flex items-center gap-1">
              <Clock className="h-3 w-3" strokeWidth={1.5} />
              Live
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-white/30" />
            </div>
          ) : (
            <div className="flex gap-3">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex-1 text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.06] transition-all duration-300 group cursor-default"
                >
                  <stat.icon className="h-4 w-4 mx-auto mb-2 text-white/30 group-hover:text-white/50 transition-colors" strokeWidth={1.5} />
                  <div className="text-lg font-semibold text-white/70 group-hover:text-white/90 transition-colors">{stat.value}</div>
                  <div className="text-[9px] text-white/30">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trending */}
        <div className={cn(
          "rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all duration-500 delay-200",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-white/[0.04] flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-white/50" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium text-sm text-white/70">{t.widgets.trendingNow}</h3>
            </div>
            <Link href="/trending" className="text-[10px] text-white/30 hover:text-white/50 transition-colors flex items-center gap-0.5">
              {t.widgets.viewAll} <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-white/30" />
            </div>
          ) : trendingPosts.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-8">{t.common.noResults}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {trendingPosts.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl transition-all duration-300 group",
                    "bg-white/[0.01] hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06]"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] text-white/20 font-medium">{i + 1}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-white/60 truncate group-hover:text-white/80 transition-colors">
                        {post.filename || post.title}
                      </span>
                      <span className="text-[10px] text-white/30">@{post.author?.username || 'anonymous'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-md bg-white/[0.03] group-hover:bg-white/[0.06] transition-colors">
                    <Star className="h-3 w-3 text-white/30" strokeWidth={1.5} />
                    <span className="text-[10px] text-white/40">{formatNumber(post.likes_count || 0)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Contributors */}
        <div className={cn(
          "rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all duration-500 delay-300",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-white/[0.04] flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-white/50" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium text-sm text-white/70">{t.widgets.topContributors}</h3>
            </div>
            <Link href="/explore" className="text-[10px] text-white/30 hover:text-white/50 transition-colors flex items-center gap-0.5">
              {t.widgets.viewAll} <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-white/30" />
            </div>
          ) : topContributors.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-8">{t.common.noResults}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topContributors.map((contributor, index) => (
                <Link
                  key={contributor.username}
                  href={`/user/${contributor.username}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-all duration-300 group"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8 border border-white/[0.06] group-hover:border-white/[0.12] transition-colors">
                      <AvatarImage src={contributor.avatar || "/developer-avatar.png"} />
                      <AvatarFallback className="bg-white/[0.04] text-white/40 text-[10px]">
                        {(contributor.display_name || contributor.username)?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    {index < 3 && (
                      <span className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold",
                        index === 0 && "bg-yellow-500/80 text-yellow-950",
                        index === 1 && "bg-gray-400/80 text-gray-950",
                        index === 2 && "bg-orange-600/80 text-orange-950"
                      )}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium text-white/60 truncate group-hover:text-white/80 transition-colors">
                      {contributor.display_name || contributor.username}
                    </span>
                    <span className="text-[10px] text-white/30">@{contributor.username}</span>
                  </div>
                  <span className="text-[10px] text-white/25 bg-white/[0.03] px-2 py-0.5 rounded group-hover:bg-white/[0.06] transition-colors">
                    {(contributor as any).posts_count || 0}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* AI Assistant */}
        <div className={cn(
          "transition-all duration-500 delay-400",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <AiAssistantWidget />
        </div>

        {/* Footer */}
        <div className={cn(
          "px-2 py-3 transition-all duration-500 delay-500",
          mounted ? "opacity-100" : "opacity-0"
        )}>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/20">
            <Link href="/about" className="hover:text-white/40 transition-colors">{t.widgets.aboutUs}</Link>
            <Link href="/terms" className="hover:text-white/40 transition-colors">{t.widgets.terms}</Link>
            <Link href="/privacy" className="hover:text-white/40 transition-colors">{t.widgets.privacy}</Link>
            <Link href="/help" className="hover:text-white/40 transition-colors">{t.widgets.help}</Link>
          </div>
          <p className="text-[9px] text-white/15 mt-2">© 2025 GitForum</p>
        </div>
      </div>
    </aside>
  )
}
