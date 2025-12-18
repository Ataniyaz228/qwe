"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MapPin,
  LinkIcon,
  Github,
  Calendar,
  MessageSquare,
  Code2,
  Heart,
  Bookmark,
  Settings,
  Share2,
  Loader2,
  Eye,
  FileCode,
  Users,
  UserPlus,
  Sparkles,
  ExternalLink,
  TrendingUp,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { usersAPI, postsAPI } from "@/lib/api"
import type { Post } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const languageColors: Record<string, string> = {
  typescript: "bg-blue-400",
  javascript: "bg-yellow-400",
  python: "bg-green-400",
  rust: "bg-orange-400",
  go: "bg-cyan-400",
  java: "bg-red-400",
  csharp: "bg-purple-400",
  cpp: "bg-pink-400",
  css: "bg-purple-400",
  html: "bg-orange-300",
}

interface PostCardProps {
  post: Post
  index: number
  noDescription: string
}

function PostCard({ post, index, noDescription }: PostCardProps) {
  const langColor = languageColors[post.language?.toLowerCase() || ""] || "bg-white/30"

  return (
    <Link href={`/post/${post.id}`}>
      <div
        className="group p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.03] transition-all duration-500 cursor-pointer hover:translate-x-1"
        style={{
          animationDelay: `${index * 80}ms`,
          animation: 'fadeSlideUp 0.5s ease-out forwards',
          opacity: 0,
          transform: 'translateY(10px)'
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("h-2 w-2 rounded-full transition-all group-hover:scale-125", langColor)} />
              <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">{post.language || "Unknown"}</span>
              <span className="text-white/10">•</span>
              <span className="text-[10px] text-white/20">{new Date(post.created_at).toLocaleDateString('ru-RU')}</span>
            </div>
            <h3 className="font-medium text-white/80 group-hover:text-white transition-colors duration-300">
              {post.filename || post.title}
            </h3>
            <p className="text-xs text-white/35 mt-1.5 line-clamp-2 leading-relaxed">
              {post.description || noDescription}
            </p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
            <ExternalLink className="h-4 w-4 text-white/40" strokeWidth={1.5} />
          </div>
        </div>
        <div className="flex items-center gap-5 mt-4 pt-3 border-t border-white/[0.04]">
          <span className={cn(
            "flex items-center gap-1.5 text-xs transition-all duration-300",
            post.is_liked ? "text-rose-400" : "text-white/25 group-hover:text-rose-400/60"
          )}>
            <Heart className={cn("h-3.5 w-3.5 transition-transform group-hover:scale-110", post.is_liked && "fill-current")} strokeWidth={1.5} />
            {post.likes_count}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-white/25 group-hover:text-blue-400/60 transition-colors duration-300">
            <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
            {post.comments_count}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-white/25 group-hover:text-white/50 transition-colors duration-300">
            <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
            {post.views}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { t } = useLanguage()

  const [activeTab, setActiveTab] = useState("posts")
  const [posts, setPosts] = useState<Post[]>([])
  const [bookmarks, setBookmarks] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    totalLikes: 0,
    totalViews: 0,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (!user?.username) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [postsData, bookmarksData, followersData, followingData] = await Promise.all([
          usersAPI.getPosts(user.username),
          postsAPI.bookmarks(),
          usersAPI.getFollowers(user.username).catch(() => ({ results: [] })),
          usersAPI.getFollowing(user.username).catch(() => ({ results: [] })),
        ])

        const postsList = postsData.results || []
        setPosts(postsList)
        setBookmarks(bookmarksData.results || [])

        const totalLikes = postsList.reduce((sum: number, p: Post) => sum + (p.likes_count || 0), 0)
        const totalViews = postsList.reduce((sum: number, p: Post) => sum + (p.views || 0), 0)

        setStats({
          posts: postsList.length,
          followers: followersData.results?.length || 0,
          following: followingData.results?.length || 0,
          totalLikes,
          totalViews,
        })
      } catch (err) {
        console.error("Error fetching profile data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.username])

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success("Ссылка скопирована!")
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center animate-pulse">
          <Loader2 className="h-5 w-5 animate-spin text-white/40" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const statItems = [
    { label: t.pages.profile.posts, value: stats.posts, icon: FileCode },
    { label: t.pages.profile.followers, value: stats.followers, icon: Users },
    { label: t.pages.profile.following, value: stats.following, icon: UserPlus },
    { label: t.pages.profile.likes, value: stats.totalLikes, icon: Heart },
    { label: t.pages.profile.views, value: stats.totalViews, icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-white/[0.01] rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeSlideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56 relative z-10">
          <div className="max-w-4xl mx-auto px-4 py-8">

            {/* Profile Header Card */}
            <div className={cn(
              "rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-[#0c0c0e] overflow-hidden mb-6 transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}>
              {/* Animated Cover */}
              <div className="h-28 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02]" />
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 3s infinite linear'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0c0c0e]" />

                {/* Floating elements */}
                <div className="absolute top-4 right-8 h-2 w-2 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: '0s' }} />
                <div className="absolute top-8 right-20 h-1.5 w-1.5 rounded-full bg-white/5 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-6 right-32 h-1 w-1 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: '2s' }} />
              </div>

              <div className="px-6 pb-6 -mt-14 relative">
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Avatar with glow */}
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-full bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Avatar className="h-28 w-28 border-4 border-[#0c0c0e] ring-2 ring-white/[0.1] transition-all duration-500 group-hover:ring-white/[0.2] group-hover:scale-105">
                      <AvatarImage src={user.avatar || "/developer-avatar.png"} />
                      <AvatarFallback className="bg-white/[0.04] text-white/40 text-2xl">
                        {user.display_name?.[0] || user.username?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-green-500 border-3 border-[#0c0c0e] animate-pulse" style={{ animationDuration: '2s' }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 pt-2 sm:pt-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-3">
                          <h1 className="text-2xl font-semibold text-white/90">{user.display_name || user.username}</h1>
                          {user.is_verified && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 text-[10px]">
                              <Zap className="h-3 w-3" strokeWidth={2} />
                              Pro
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/35 mt-0.5">@{user.username}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleShare}
                          className="gap-1.5 bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06] hover:text-white/70 hover:border-white/[0.12] rounded-xl transition-all duration-300"
                        >
                          <Share2 className="h-4 w-4" strokeWidth={1.5} />
                          <span className="hidden sm:inline">{t.pages.profile.share}</span>
                        </Button>
                        <Link href="/settings">
                          <Button
                            size="sm"
                            className="gap-1.5 bg-white text-black hover:bg-white/90 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                          >
                            <Settings className="h-4 w-4" strokeWidth={2} />
                            <span className="hidden sm:inline">{t.pages.profile.settings}</span>
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {user.bio && (
                      <p className="mt-4 text-sm text-white/50 leading-relaxed max-w-lg">{user.bio}</p>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-5 mt-5 text-xs">
                      {user.location && (
                        <span className="flex items-center gap-1.5 text-white/30 hover:text-white/50 transition-colors duration-300">
                          <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {user.location}
                        </span>
                      )}
                      {user.website && (
                        <a
                          href={user.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors duration-300 group"
                        >
                          <LinkIcon className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" strokeWidth={1.5} />
                          {user.website.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                      {user.github_username && (
                        <a
                          href={`https://github.com/${user.github_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors duration-300 group"
                        >
                          <Github className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" strokeWidth={1.5} />
                          {user.github_username}
                        </a>
                      )}
                      {user.date_joined && (
                        <span className="flex items-center gap-1.5 text-white/30">
                          <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {t.pages.profile.joined} {formatDate(user.date_joined)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid - Monochrome */}
            <div className={cn(
              "grid grid-cols-5 gap-2 mb-6 transition-all duration-700 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}>
              {statItems.map((stat, i) => (
                <div
                  key={stat.label}
                  className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.03] text-center transition-all duration-300 hover:-translate-y-1 cursor-default"
                  style={{
                    animationDelay: `${200 + i * 80}ms`,
                    animation: 'fadeSlideUp 0.5s ease-out forwards',
                    opacity: 0,
                    transform: 'translateY(10px)'
                  }}
                >
                  <stat.icon className="h-4 w-4 mx-auto mb-2 text-white/20 group-hover:text-white/40 transition-colors duration-300" strokeWidth={1.5} />
                  <p className="text-xl font-medium text-white/70 group-hover:text-white/90 transition-colors duration-300">{stat.value}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className={cn(
              "transition-all duration-700 delay-200",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}>
              {/* Tab Buttons */}
              <div className="flex gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/[0.04] w-fit mb-5">
                <button
                  onClick={() => setActiveTab("posts")}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all duration-300",
                    activeTab === "posts"
                      ? "bg-white text-black font-medium shadow-lg shadow-white/10"
                      : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
                  )}
                >
                  <Code2 className="h-4 w-4" strokeWidth={activeTab === "posts" ? 2 : 1.5} />
                  {t.pages.profile.postsTab} ({posts.length})
                </button>
                <button
                  onClick={() => setActiveTab("bookmarks")}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all duration-300",
                    activeTab === "bookmarks"
                      ? "bg-white text-black font-medium shadow-lg shadow-white/10"
                      : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
                  )}
                >
                  <Bookmark className="h-4 w-4" strokeWidth={activeTab === "bookmarks" ? 2 : 1.5} />
                  {t.pages.profile.bookmarksTab} ({bookmarks.length})
                </button>
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-white/30" />
                    <p className="text-xs text-white/20">{t.pages.profile.loading}</p>
                  </div>
                </div>
              )}

              {/* Posts Tab */}
              {!loading && activeTab === "posts" && (
                <div className="space-y-3">
                  {posts.length > 0 ? (
                    posts.map((post, i) => <PostCard key={post.id} post={post} index={i} noDescription={t.pages.profile.noDescription} />)
                  ) : (
                    <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-b from-white/[0.02] to-transparent p-16 text-center">
                      <div className="h-16 w-16 mx-auto mb-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                        <Code2 className="h-7 w-7 text-white/20" strokeWidth={1} />
                      </div>
                      <h3 className="font-medium text-white/60 mb-2">{t.pages.profile.noPosts}</h3>
                      <p className="text-sm text-white/30 mb-6 max-w-xs mx-auto">{t.pages.profile.createFirstSnippet}</p>
                      <Link href="/new">
                        <Button className="gap-2 bg-white text-black hover:bg-white/90 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-white/10">
                          <Sparkles className="h-4 w-4" strokeWidth={2} />
                          {t.pages.profile.createPost}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Bookmarks Tab */}
              {!loading && activeTab === "bookmarks" && (
                <div className="space-y-3">
                  {bookmarks.length > 0 ? (
                    bookmarks.map((post, i) => <PostCard key={post.id} post={post} index={i} noDescription={t.pages.profile.noDescription} />)
                  ) : (
                    <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-b from-white/[0.02] to-transparent p-16 text-center">
                      <div className="h-16 w-16 mx-auto mb-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                        <Bookmark className="h-7 w-7 text-white/20" strokeWidth={1} />
                      </div>
                      <h3 className="font-medium text-white/60 mb-2">{t.pages.profile.noBookmarks}</h3>
                      <p className="text-sm text-white/30 mb-6 max-w-xs mx-auto">{t.pages.profile.saveSnippets}</p>
                      <Link href="/explore">
                        <Button variant="outline" className="gap-2 bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06] rounded-xl transition-all duration-300">
                          {t.pages.profile.findSnippets}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
