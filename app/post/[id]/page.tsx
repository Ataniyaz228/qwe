"use client"

import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import {
  Heart, MessageSquare, Share2, Bookmark,
  Eye, ArrowLeft, Loader2, Copy, Check, Pencil, Trash2, AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { postsAPI } from "@/lib/api"

// Цвета языков
const languageColors: Record<string, string> = {
  javascript: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  typescript: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  python: "bg-green-500/20 text-green-400 border-green-500/30",
  rust: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  go: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  java: "bg-red-500/20 text-red-400 border-red-500/30",
  csharp: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  cpp: "bg-pink-500/20 text-pink-400 border-pink-500/30",
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

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const { post, isLoading, error, like, unlike, bookmark, unbookmark } = usePost(postId)
  const { user, isAuthenticated } = useAuth()

  const [copied, setCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isAuthor = user && post && user.username === post.author.username

  const handleCopyCode = () => {
    if (post?.code) {
      navigator.clipboard.writeText(post.code)
      setCopied(true)
      toast.success("Код скопирован!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Ссылка скопирована!")
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Войдите, чтобы лайкнуть")
      return
    }
    try {
      if (post?.is_liked) {
        await unlike()
      } else {
        await like()
      }
    } catch {
      toast.error("Ошибка")
    }
  }

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error("Войдите, чтобы сохранить")
      return
    }
    try {
      if (post?.is_bookmarked) {
        await unbookmark()
        toast.success("Убрано из закладок")
      } else {
        await bookmark()
        toast.success("Добавлено в закладки")
      }
    } catch {
      toast.error("Ошибка")
    }
  }

  const handleDelete = async () => {
    console.log("handleDelete called, deleting directly...")
    // Подтверждение через confirm блокируется браузером
    // TODO: добавить модальное окно для подтверждения
    setIsDeleting(true)
    try {
      console.log("Calling API delete for:", postId)
      await postsAPI.delete(postId)
      console.log("Delete successful")
      toast.success("Пост удалён")
      router.push("/feed")
    } catch (err) {
      console.error("Delete error:", err)
      toast.error("Ошибка удаления")
    } finally {
      setIsDeleting(false)
    }
  }

  const langColorClass = post ? (languageColors[post.language] || "bg-gray-500/20 text-gray-400") : ""

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 md:ml-16 lg:ml-56 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Загрузка поста...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Error State
  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 md:ml-16 lg:ml-56 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h2 className="text-xl font-bold">Пост не найден</h2>
              <p className="text-muted-foreground">Возможно, он был удалён или у вас нет доступа</p>
              <Link href="/feed">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Вернуться в ленту
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56">
          <div className="mx-auto max-w-4xl px-4 py-6">
            {/* Back Button */}
            <Link
              href="/feed"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад в ленту
            </Link>

            <article className="rounded-lg border border-border bg-card overflow-hidden">
              {/* Author Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Link href={`/user/${post.author.username}`}>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar || "/developer-avatar.png"} />
                      <AvatarFallback>
                        {post.author.display_name?.[0] || post.author.username[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link href={`/user/${post.author.username}`} className="font-medium hover:underline">
                      {post.author.display_name || post.author.username}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      @{post.author.username} · {formatDate(post.created_at)}
                    </p>
                  </div>
                </div>

                {isAuthor && (
                  <div className="flex items-center gap-2 relative z-50">
                    <Button variant="ghost" size="sm" className="gap-1" asChild>
                      <Link href={`/post/${post.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        Редактировать
                      </Link>
                    </Button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                      onClick={() => {
                        console.log("Delete clicked")
                        handleDelete()
                      }}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                      {isDeleting ? "Удаление..." : "Удалить"}
                    </button>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="px-6 py-4 border-b border-border">
                <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
                {post.description && (
                  <p className="text-muted-foreground">{post.description}</p>
                )}
              </div>

              {/* Code Block */}
              <div className="border-b border-border">
                {/* File Header */}
                <div className="flex items-center justify-between bg-secondary/50 px-4 py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-red-500/80" />
                      <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                      <span className="h-3 w-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="ml-2 font-mono text-sm text-muted-foreground">{post.filename}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`font-mono text-xs ${langColorClass}`}>
                      {post.language}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={handleCopyCode} className="gap-1">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Скопировано" : "Копировать"}
                    </Button>
                  </div>
                </div>

                {/* Code */}
                <CodeHighlight code={post.code || ""} language={post.language} />
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 px-6 py-4 border-b border-border">
                  {post.tags.map((tag) => (
                    <Link key={tag.id} href={`/tag/${tag.name}`}>
                      <Badge variant="outline" className="text-sm hover:bg-secondary">
                        #{tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}

              {/* Stats & Actions */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 ${post.is_liked ? "text-red-400" : "text-muted-foreground hover:text-red-400"}`}
                    onClick={handleLike}
                  >
                    <Heart className={`h-5 w-5 ${post.is_liked ? "fill-current" : ""}`} />
                    <span>{post.likes_count}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>{post.comments_count}</span>
                  </Button>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Eye className="h-5 w-5" />
                    <span>{post.views} просмотров</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${post.is_bookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                    onClick={handleBookmark}
                  >
                    <Bookmark className={`h-5 w-5 ${post.is_bookmarked ? "fill-current" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </article>

            {/* Comments Section */}
            <Comments postId={postId} commentsCount={post.comments_count} />
          </div>
        </main>
      </div>
    </div>
  )
}
