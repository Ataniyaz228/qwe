"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, Eye, FileCode, Copy, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { postsAPI, type Post } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { CodeHighlight } from "@/components/code-highlight"
import { cn } from "@/lib/utils"

interface APIPostCardProps {
    post: Post
    onUpdate?: (post: Post) => void
}

// Языковые цвета (тонкие, монохромные)
const languageColors: Record<string, { bg: string; text: string; dot: string }> = {
    javascript: { bg: "bg-yellow-500/10", text: "text-yellow-400/80", dot: "bg-yellow-400" },
    typescript: { bg: "bg-blue-500/10", text: "text-blue-400/80", dot: "bg-blue-400" },
    python: { bg: "bg-green-500/10", text: "text-green-400/80", dot: "bg-green-400" },
    rust: { bg: "bg-orange-500/10", text: "text-orange-400/80", dot: "bg-orange-400" },
    go: { bg: "bg-cyan-500/10", text: "text-cyan-400/80", dot: "bg-cyan-400" },
    java: { bg: "bg-red-500/10", text: "text-red-400/80", dot: "bg-red-400" },
    csharp: { bg: "bg-purple-500/10", text: "text-purple-400/80", dot: "bg-purple-400" },
    cpp: { bg: "bg-pink-500/10", text: "text-pink-400/80", dot: "bg-pink-400" },
    html: { bg: "bg-orange-400/10", text: "text-orange-300/80", dot: "bg-orange-400" },
    css: { bg: "bg-blue-400/10", text: "text-blue-300/80", dot: "bg-blue-400" },
    sql: { bg: "bg-emerald-500/10", text: "text-emerald-400/80", dot: "bg-emerald-400" },
    shell: { bg: "bg-slate-500/10", text: "text-slate-400/80", dot: "bg-slate-400" },
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "только что"
    if (diffMins < 60) return `${diffMins} мин`
    if (diffHours < 24) return `${diffHours}ч`
    if (diffDays < 7) return `${diffDays}д`

    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
}

export function APIPostCard({ post, onUpdate }: APIPostCardProps) {
    const { isAuthenticated } = useAuth()
    const [isLiking, setIsLiking] = useState(false)
    const [isBookmarking, setIsBookmarking] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [localPost, setLocalPost] = useState(post)
    const [isHovered, setIsHovered] = useState(false)

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

    const handleCopyCode = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const code = post.code_preview || post.code || ""
        navigator.clipboard.writeText(code)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
        toast.success("Код скопирован")
    }

    const langColor = languageColors[post.language] || { bg: "bg-white/5", text: "text-white/50", dot: "bg-white/40" }

    const codeToShow = post.code_preview || post.code || ""
    const codeLines = codeToShow.split("\n")
    const displayCode = codeLines.slice(0, 6).join("\n")
    const hasMoreCode = codeLines.length > 6

    return (
        <Link href={`/post/${post.id}`} className="block group">
            <article
                className={cn(
                    "rounded-2xl border bg-[#0c0c0e] overflow-hidden transition-all duration-300",
                    "border-white/[0.04] hover:border-white/[0.08]",
                    isHovered && "shadow-lg shadow-white/[0.02]"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-white/[0.06] transition-all duration-300 group-hover:border-white/[0.12]">
                            <AvatarImage src={post.author.avatar || "/developer-avatar.png"} />
                            <AvatarFallback className="bg-white/[0.04] text-white/50 text-xs">
                                {post.author.display_name?.[0] || post.author.username[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-white/80 group-hover:text-white/95 transition-colors">
                                {post.author.display_name || post.author.username}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-white/35">
                                <span>@{post.author.username}</span>
                                <span className="text-white/20">·</span>
                                <span>{formatTimeAgo(post.created_at)}</span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/25 hover:text-white/50 hover:bg-white/[0.04] rounded-lg"
                        onClick={(e) => e.preventDefault()}
                    >
                        <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                </div>

                {/* Title & Description */}
                {(post.title || post.description) && (
                    <div className="px-4 pb-3">
                        {post.title && (
                            <h3 className="font-medium text-white/85 mb-1 group-hover:text-white transition-colors">
                                {post.title}
                            </h3>
                        )}
                        {post.description && (
                            <p className="text-sm text-white/40 line-clamp-2">{post.description}</p>
                        )}
                    </div>
                )}

                {/* Code Block */}
                <div className="mx-3 mb-3 rounded-xl overflow-hidden border border-white/[0.04] bg-[#09090b]">
                    {/* Code Header */}
                    <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/[0.04]">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08] hover:bg-red-500/60 transition-colors" />
                                <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08] hover:bg-yellow-500/60 transition-colors" />
                                <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08] hover:bg-green-500/60 transition-colors" />
                            </div>
                            <div className="flex items-center gap-2 ml-1">
                                <FileCode className="h-3.5 w-3.5 text-white/25" strokeWidth={1.5} />
                                <span className="font-mono text-xs text-white/40">{post.filename}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-white/25 hover:text-white/60 hover:bg-white/[0.04] rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                onClick={handleCopyCode}
                            >
                                {isCopied ? (
                                    <Check className="h-3 w-3 text-green-400" strokeWidth={2} />
                                ) : (
                                    <Copy className="h-3 w-3" strokeWidth={1.5} />
                                )}
                            </Button>
                            <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-md", langColor.bg)}>
                                <span className={cn("h-1.5 w-1.5 rounded-full", langColor.dot)} />
                                <span className={cn("font-mono text-[10px]", langColor.text)}>{post.language}</span>
                            </div>
                        </div>
                    </div>

                    {/* Code Content */}
                    {displayCode && (
                        <div className="overflow-hidden">
                            <div className="max-h-36">
                                <CodeHighlight
                                    code={displayCode}
                                    language={post.language || "text"}
                                    showLineNumbers={false}
                                />
                            </div>
                            {hasMoreCode && (
                                <div className="px-3 py-1.5 text-[10px] text-white/25 bg-white/[0.02] border-t border-white/[0.04] text-center">
                                    ... показать ещё
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                        {post.tags.map((tag) => (
                            <span
                                key={tag.id}
                                className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[11px] text-white/40 hover:bg-white/[0.06] hover:text-white/60 transition-colors cursor-pointer"
                            >
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between px-2 py-2 border-t border-white/[0.04]">
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "gap-1.5 h-8 px-2.5 rounded-lg transition-all",
                                localPost.is_liked
                                    ? "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                    : "text-white/35 hover:text-rose-400 hover:bg-rose-500/10"
                            )}
                            onClick={handleLike}
                            disabled={isLiking}
                        >
                            <Heart className={cn("h-4 w-4", localPost.is_liked && "fill-current")} strokeWidth={1.5} />
                            <span className="text-xs font-medium">{localPost.likes_count}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 h-8 px-2.5 rounded-lg text-white/35 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                            onClick={(e) => e.preventDefault()}
                        >
                            <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
                            <span className="text-xs font-medium">{post.comments_count}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 h-8 px-2.5 rounded-lg text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                            onClick={(e) => e.preventDefault()}
                        >
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                            <span className="text-xs font-medium">{post.views}</span>
                        </Button>
                    </div>
                    <div className="flex items-center gap-0.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 rounded-lg transition-all",
                                localPost.is_bookmarked
                                    ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                                    : "text-white/35 hover:text-yellow-400 hover:bg-yellow-500/10"
                            )}
                            onClick={handleBookmark}
                            disabled={isBookmarking}
                        >
                            <Bookmark className={cn("h-4 w-4", localPost.is_bookmarked && "fill-current")} strokeWidth={1.5} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                            onClick={handleShare}
                        >
                            <Share2 className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                    </div>
                </div>
            </article>
        </Link>
    )
}
