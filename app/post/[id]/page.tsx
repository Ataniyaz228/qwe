"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Comments } from "@/components/comments"
import { CodeHighlight } from "@/components/code-highlight"
import { usePost } from "@/hooks/usePosts"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Heart, MessageSquare, Share2, Bookmark,
  Eye, ArrowLeft, Loader2, Copy, Check, Pencil, Trash2, AlertCircle,
  FileCode, Clock, Hash, ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { postsAPI } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"

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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins} мин назад`
  if (diffHours < 24) return `${diffHours} ч назад`
  if (diffDays < 7) return `${diffDays} дн назад`
  return formatDate(dateString)
}

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const { post, isLoading, error, like, unlike, bookmark, unbookmark } = usePost(postId)
  const { user, isAuthenticated } = useAuth()

  const [copied, setCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isAuthor = user && post && user.username === post.author.username
  const color = post ? (languageColors[post.language?.toLowerCase()] || { bg: "from-white/5 to-white/[0.02]", dot: "bg-white/40" }) : { bg: "", dot: "" }

  const handleCopyCode = () => {
    if (post?.code) {
      navigator.clipboard.writeText(post.code)
      setCopied(true)
      toast.success(t.pages.post.codeCopied)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success(t.pages.post.linkCopied)
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error(t.pages.post.loginToLike)
      return
    }
    try {
      if (post?.is_liked) await unlike()
      else await like()
    } catch {
      toast.error("Ошибка")
    }
  }

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error(t.pages.post.loginToBookmark)
      return
    }
    try {
      if (post?.is_bookmarked) {
        await unbookmark()
        toast.success(t.pages.post.removedFromBookmarks)
      } else {
        await bookmark()
        toast.success(t.pages.post.addedToBookmarks)
      }
    } catch {
      toast.error("Ошибка")
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await postsAPI.delete(postId)
      toast.success(t.pages.post.postDeleted)
      router.push("/feed")
    } catch (err) {
      toast.error(t.pages.post.deleteError)
    } finally {
      setIsDeleting(false)
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b]">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 md:ml-16 lg:ml-56 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-white/40" />
              </div>
              <p className="text-sm text-white/30">{t.pages.post.loadingPost}</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Error State
  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#09090b]">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 md:ml-16 lg:ml-56 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-red-400" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-medium text-white/70">{t.pages.post.postNotFound}</h2>
              <p className="text-sm text-white/35">{t.pages.post.maybeDeleted}</p>
              <Link href="/feed">
                <Button variant="outline" className="gap-2 bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05] rounded-xl">
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                  {t.pages.post.back}
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-white/[0.008] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-white/[0.008] rounded-full blur-[150px]" />
      </div>

      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56 relative z-10">
          <div className="mx-auto max-w-4xl px-4 py-6">
            {/* Back Button */}
            <Link
              href="/feed"
              className={cn(
                "inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 mb-6 transition-all duration-500",
                mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              )}
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              {t.pages.post.backToFeed}
            </Link>

            <article className={cn(
              "rounded-2xl border border-white/[0.04] bg-[#0c0c0e] overflow-hidden transition-all duration-500 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              {/* Author Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <Link href={`/user/${post.author.username}`}>
                    <Avatar className="h-11 w-11 border-2 border-white/[0.08] transition-all hover:border-white/[0.15]">
                      <AvatarImage src={post.author.avatar || "/developer-avatar.png"} />
                      <AvatarFallback className="bg-white/[0.04] text-white/40">
                        {post.author.display_name?.[0] || post.author.username[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link href={`/user/${post.author.username}`} className="font-medium text-white/80 hover:text-white transition-colors">
                      {post.author.display_name || post.author.username}
                    </Link>
                    <p className="text-xs text-white/35 flex items-center gap-1.5">
                      <span>@{post.author.username}</span>
                      <span className="text-white/20">·</span>
                      <Clock className="h-3 w-3" strokeWidth={1.5} />
                      <span>{formatRelativeDate(post.created_at)}</span>
                    </p>
                  </div>
                </div>

                {isAuthor && (
                  <div className="flex items-center gap-2">
                    <Link href={`/post/${post.id}/edit`}>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg">
                        <Pencil className="h-4 w-4" strokeWidth={1.5} />
                        {t.pages.post.edit}
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="gap-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-lg"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      {isDeleting ? "..." : t.pages.post.delete}
                    </Button>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="px-6 py-5 border-b border-white/[0.04]">
                <h1 className="text-xl font-semibold text-white/90 mb-2">{post.title}</h1>
                {post.description && (
                  <p className="text-sm text-white/40 leading-relaxed">{post.description}</p>
                )}
              </div>

              {/* Code Block */}
              <div className="border-b border-white/[0.04]">
                {/* File Header */}
                <div className="flex items-center justify-between bg-white/[0.02] px-4 py-3 border-b border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-white/[0.08]" />
                      <span className="h-3 w-3 rounded-full bg-white/[0.08]" />
                      <span className="h-3 w-3 rounded-full bg-white/[0.08]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-white/30" strokeWidth={1.5} />
                      <span className="font-mono text-sm text-white/50">{post.filename}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04]">
                      <span className={cn("h-2 w-2 rounded-full", color.dot)} />
                      <span className="text-xs font-mono text-white/50">{post.language}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyCode}
                      className="gap-1.5 text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-400" strokeWidth={2} /> : <Copy className="h-4 w-4" strokeWidth={1.5} />}
                      {copied ? t.pages.post.copied : t.pages.post.copy}
                    </Button>
                  </div>
                </div>

                {/* Code */}
                <CodeHighlight code={post.code || ""} language={post.language} />
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 px-6 py-4 border-b border-white/[0.04]">
                  <Hash className="h-4 w-4 text-white/20" strokeWidth={1.5} />
                  {post.tags.map((tag) => (
                    <Link key={tag.id} href={`/explore?tag=${tag.name}`}>
                      <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] text-xs text-white/40 hover:bg-white/[0.06] hover:text-white/60 transition-colors">
                        #{tag.name}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Stats & Actions */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-2 rounded-lg transition-all",
                      post.is_liked
                        ? "text-rose-400 hover:text-rose-400 hover:bg-rose-500/10"
                        : "text-white/40 hover:text-rose-400 hover:bg-rose-500/10"
                    )}
                    onClick={handleLike}
                  >
                    <Heart className={cn("h-5 w-5", post.is_liked && "fill-current")} strokeWidth={1.5} />
                    <span>{post.likes_count}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-white/40 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"
                  >
                    <MessageSquare className="h-5 w-5" strokeWidth={1.5} />
                    <span>{post.comments_count}</span>
                  </Button>
                  <div className="flex items-center gap-2 px-3 py-1.5 text-white/30 text-sm">
                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                    <span>{post.views}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-9 w-9 rounded-lg transition-all",
                      post.is_bookmarked
                        ? "text-yellow-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                        : "text-white/30 hover:text-yellow-400 hover:bg-yellow-500/10"
                    )}
                    onClick={handleBookmark}
                  >
                    <Bookmark className={cn("h-5 w-5", post.is_bookmarked && "fill-current")} strokeWidth={1.5} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-white/30 hover:text-white/60 hover:bg-white/[0.04] rounded-lg"
                    onClick={handleShare}
                  >
                    <ExternalLink className="h-5 w-5" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
            </article>

            {/* Comments Section */}
            <div className={cn(
              "transition-all duration-500 delay-200",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <Comments postId={postId} commentsCount={post.comments_count} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
