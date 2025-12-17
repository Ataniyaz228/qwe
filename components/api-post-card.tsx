"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, GitFork, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { postsAPI, type Post } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { CodeHighlight } from "@/components/code-highlight"

interface APIPostCardProps {
    post: Post
    onUpdate?: (post: Post) => void
}

// Языковые цвета для бейджей
const languageColors: Record<string, string> = {
    javascript: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    typescript: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    python: "bg-green-500/20 text-green-400 border-green-500/30",
    rust: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    go: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    java: "bg-red-500/20 text-red-400 border-red-500/30",
    csharp: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    cpp: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    html: "bg-orange-400/20 text-orange-300 border-orange-400/30",
    css: "bg-blue-400/20 text-blue-300 border-blue-400/30",
    sql: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    shell: "bg-slate-500/20 text-slate-400 border-slate-500/30",
}

// Форматирование даты
function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "только что"
    if (diffMins < 60) return `${diffMins} мин назад`
    if (diffHours < 24) return `${diffHours}ч назад`
    if (diffDays < 7) return `${diffDays}д назад`

    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
}

export function APIPostCard({ post, onUpdate }: APIPostCardProps) {
    const { isAuthenticated } = useAuth()
    const [isLiking, setIsLiking] = useState(false)
    const [isBookmarking, setIsBookmarking] = useState(false)
    const [localPost, setLocalPost] = useState(post)

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!isAuthenticated) {
            toast.error("Войдите, чтобы лайкнуть")
            return
        }

        setIsLiking(true)
        try {
            if (localPost.is_liked) {
                await postsAPI.unlike(post.id)
                setLocalPost(prev => ({ ...prev, is_liked: false, likes_count: prev.likes_count - 1 }))
            } else {
                await postsAPI.like(post.id)
                setLocalPost(prev => ({ ...prev, is_liked: true, likes_count: prev.likes_count + 1 }))
            }
            onUpdate?.(localPost)
        } catch (err) {
            toast.error("Ошибка")
        } finally {
            setIsLiking(false)
        }
    }

    const handleBookmark = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!isAuthenticated) {
            toast.error("Войдите, чтобы сохранить")
            return
        }

        setIsBookmarking(true)
        try {
            if (localPost.is_bookmarked) {
                await postsAPI.unbookmark(post.id)
                setLocalPost(prev => ({ ...prev, is_bookmarked: false, bookmarks_count: prev.bookmarks_count - 1 }))
                toast.success("Убрано из закладок")
            } else {
                await postsAPI.bookmark(post.id)
                setLocalPost(prev => ({ ...prev, is_bookmarked: true, bookmarks_count: prev.bookmarks_count + 1 }))
                toast.success("Добавлено в закладки")
            }
            onUpdate?.(localPost)
        } catch (err) {
            toast.error("Ошибка")
        } finally {
            setIsBookmarking(false)
        }
    }

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const url = `${window.location.origin}/post/${post.id}`
        navigator.clipboard.writeText(url)
        toast.success("Ссылка скопирована")
    }

    const langColorClass = languageColors[post.language] || "bg-gray-500/20 text-gray-400 border-gray-500/30"

    // Используем code_preview из списка или полный code из деталей (max 6 строк)
    const codeToShow = post.code_preview || post.code || ""
    const codeLines = codeToShow.split("\n")
    const displayCode = codeLines.slice(0, 6).join("\n")
    const hasMoreCode = codeLines.length > 6

    return (
        <Link href={`/post/${post.id}`} className="block">
            <article className="rounded-lg border border-border bg-card overflow-hidden transition-colors hover:border-primary/50">
                {/* Post Header - Author Info */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={post.author.avatar || "/developer-avatar.png"} />
                            <AvatarFallback>
                                {post.author.display_name?.[0] || post.author.username[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">
                                {post.author.display_name || post.author.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                @{post.author.username} · {formatTimeAgo(post.created_at)}
                            </span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.preventDefault()}>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>

                {/* Title & Description */}
                {(post.title || post.description) && (
                    <div className="px-4 py-3 border-b border-border">
                        {post.title && <h3 className="font-medium mb-1">{post.title}</h3>}
                        {post.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
                        )}
                    </div>
                )}

                {/* Code File Header */}
                <div className="flex items-center justify-between bg-secondary/50 px-4 py-2 border-b border-border">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <span className="h-3 w-3 rounded-full bg-red-500/80" />
                            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                            <span className="h-3 w-3 rounded-full bg-green-500/80" />
                        </div>
                        <span className="ml-2 font-mono text-sm text-muted-foreground">{post.filename}</span>
                    </div>
                    <Badge variant="outline" className={`font-mono text-xs ${langColorClass}`}>
                        {post.language}
                    </Badge>
                </div>

                {/* Code Block with Syntax Highlighting */}
                {displayCode && (
                    <div className="overflow-hidden max-h-40">
                        <CodeHighlight
                            code={displayCode}
                            language={post.language || "text"}
                            showLineNumbers={false}
                        />
                        {hasMoreCode && (
                            <div className="px-4 py-2 text-xs text-muted-foreground bg-secondary/30 border-t border-border">
                                ... ещё код
                            </div>
                        )}
                    </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-4 py-3 border-t border-border">
                        {post.tags.map((tag) => (
                            <Badge key={tag.id} variant="outline" className="text-xs font-normal">
                                #{tag.name}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Stats & Actions */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`gap-1.5 ${localPost.is_liked ? "text-red-400" : "text-muted-foreground hover:text-red-400"}`}
                            onClick={handleLike}
                            disabled={isLiking}
                        >
                            <Heart className={`h-4 w-4 ${localPost.is_liked ? "fill-current" : ""}`} />
                            <span className="text-xs">{localPost.likes_count}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-muted-foreground hover:text-primary"
                            onClick={(e) => e.preventDefault()}
                        >
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-xs">{post.comments_count}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-muted-foreground"
                            onClick={(e) => e.preventDefault()}
                        >
                            <Eye className="h-4 w-4" />
                            <span className="text-xs">{post.views}</span>
                        </Button>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${localPost.is_bookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                            onClick={handleBookmark}
                            disabled={isBookmarking}
                        >
                            <Bookmark className={`h-4 w-4 ${localPost.is_bookmarked ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={handleShare}
                        >
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </article>
        </Link>
    )
}
