"use client"

import { useState, useEffect } from "react"
import { postsAPI, type Comment as CommentType } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, MessageSquare, Send, Reply, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"

interface CommentsProps {
    postId: string
    commentsCount: number
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

function CommentItem({
    comment,
    postId,
    onReplyAdded,
    onCommentDeleted,
    depth = 0
}: {
    comment: CommentType
    postId: string
    onReplyAdded: (reply: CommentType, parentId: string) => void
    onCommentDeleted: (commentId: string) => void
    depth?: number
}) {
    const maxDepth = 5
    const isNested = depth > 0
    const { user, isAuthenticated } = useAuth()
    const { t } = useLanguage()
    const [showReplyForm, setShowReplyForm] = useState(false)
    const [replyContent, setReplyContent] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [showReplies, setShowReplies] = useState(true)
    const [deleting, setDeleting] = useState(false)

    const isOwner = user?.username === comment.author.username

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await postsAPI.deleteComment(comment.id)
            onCommentDeleted(comment.id)
            toast.success(t.validation.commentDeleted)
        } catch (err) {
            toast.error(t.validation.deleteError)
        } finally {
            setDeleting(false)
        }
    }

    const handleReply = async () => {
        if (!replyContent.trim()) return

        setSubmitting(true)
        try {
            const reply = await postsAPI.addComment(postId, replyContent.trim(), comment.id)
            onReplyAdded(reply, comment.id)
            setReplyContent("")
            setShowReplyForm(false)
            toast.success(t.validation.replyAdded)
        } catch (err) {
            toast.error(t.validation.replyError)
        } finally {
            setSubmitting(false)
        }
    }

    const hasReplies = comment.replies && comment.replies.length > 0

    return (
        <div className={cn(
            "group transition-all",
            !isNested && "p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08]"
        )}>
            <div className="flex gap-3">
                <Link href={`/user/${comment.author.username}`}>
                    <Avatar className={cn(
                        "border border-white/[0.08] transition-all hover:border-white/[0.15]",
                        isNested ? "h-7 w-7" : "h-9 w-9"
                    )}>
                        <AvatarImage src={comment.author.avatar || "/developer-avatar.png"} />
                        <AvatarFallback className="bg-white/[0.04] text-white/40 text-xs">
                            {comment.author.display_name?.[0] || comment.author.username[0]}
                        </AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Link
                            href={`/user/${comment.author.username}`}
                            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                        >
                            {comment.author.display_name || comment.author.username}
                        </Link>
                        <span className="text-[10px] text-white/25">
                            @{comment.author.username}
                        </span>
                        <span className="text-[10px] text-white/20">
                            · {formatTimeAgo(comment.created_at)}
                        </span>
                    </div>
                    <p className="text-sm text-white/60 whitespace-pre-wrap leading-relaxed">{comment.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {depth < maxDepth && isAuthenticated && (
                            <button
                                className="flex items-center gap-1 px-2 py-1 text-[10px] text-white/30 hover:text-white/60 hover:bg-white/[0.04] rounded-lg transition-colors"
                                onClick={() => setShowReplyForm(!showReplyForm)}
                            >
                                <Reply className="h-3 w-3" strokeWidth={1.5} />
                                {t.comments.reply}
                            </button>
                        )}
                        {hasReplies && (
                            <button
                                className="flex items-center gap-1 px-2 py-1 text-[10px] text-white/30 hover:text-white/60 hover:bg-white/[0.04] rounded-lg transition-colors"
                                onClick={() => setShowReplies(!showReplies)}
                            >
                                {showReplies ? <ChevronUp className="h-3 w-3" strokeWidth={1.5} /> : <ChevronDown className="h-3 w-3" strokeWidth={1.5} />}
                                {comment.replies_count}
                            </button>
                        )}
                        {isOwner && (
                            <button
                                className="flex items-center gap-1 px-2 py-1 text-[10px] text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <>
                                        <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                                        {t.comments.delete}
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Reply Form */}
                    {showReplyForm && (
                        <div className="mt-3 flex gap-2">
                            <Avatar className="h-7 w-7 border border-white/[0.08]">
                                <AvatarImage src={user?.avatar || "/developer-avatar.png"} />
                                <AvatarFallback className="bg-white/[0.04] text-white/40 text-[10px]">{user?.username?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <Textarea
                                    placeholder={`Ответить @${comment.author.username}...`}
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    className="min-h-16 resize-none text-sm bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.12] focus-visible:ring-0 rounded-xl"
                                    disabled={submitting}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg"
                                        onClick={() => { setShowReplyForm(false); setReplyContent("") }}
                                    >
                                        {t.comments.cancel}
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-white text-black hover:bg-white/90 rounded-lg"
                                        onClick={handleReply}
                                        disabled={submitting || !replyContent.trim()}
                                    >
                                        {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : t.comments.replyTo}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Replies */}
                    {hasReplies && showReplies && (
                        <div className="mt-3 ml-4 border-l border-white/[0.06] pl-4 space-y-3">
                            {comment.replies?.map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    postId={postId}
                                    onReplyAdded={onReplyAdded}
                                    onCommentDeleted={onCommentDeleted}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export function Comments({ postId, commentsCount }: CommentsProps) {
    const { user, isAuthenticated } = useAuth()
    const { t } = useLanguage()
    const [comments, setComments] = useState<CommentType[]>([])
    const [loading, setLoading] = useState(true)
    const [newComment, setNewComment] = useState("")
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        loadComments()
    }, [postId])

    const loadComments = async () => {
        setLoading(true)
        try {
            const response = await postsAPI.getComments(postId)
            setComments(response.results || [])
        } catch (err) {
            console.error("Ошибка загрузки комментариев:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isAuthenticated) {
            toast.error(t.validation.loginToComment)
            return
        }

        if (!newComment.trim()) {
            toast.error(t.validation.commentEmpty)
            return
        }

        setSubmitting(true)
        try {
            const comment = await postsAPI.addComment(postId, newComment.trim())
            setComments([...comments, comment])
            setNewComment("")
            toast.success(t.validation.commentAdded)
        } catch (err) {
            toast.error(t.validation.commentAddError)
        } finally {
            setSubmitting(false)
        }
    }

    const addReplyRecursive = (comments: CommentType[], parentId: string, reply: CommentType): CommentType[] => {
        return comments.map(c => {
            if (c.id === parentId) {
                return {
                    ...c,
                    replies: [...(c.replies || []), reply],
                    replies_count: (c.replies_count || 0) + 1
                }
            }
            if (c.replies && c.replies.length > 0) {
                return {
                    ...c,
                    replies: addReplyRecursive(c.replies, parentId, reply)
                }
            }
            return c
        })
    }

    const handleReplyAdded = (reply: CommentType, parentId: string) => {
        setComments(addReplyRecursive(comments, parentId, reply))
    }

    const removeCommentRecursive = (comments: CommentType[], commentId: string): CommentType[] => {
        return comments
            .filter(c => c.id !== commentId)
            .map(c => ({
                ...c,
                replies: c.replies ? removeCommentRecursive(c.replies, commentId) : []
            }))
    }

    const handleCommentDeleted = (commentId: string) => {
        setComments(removeCommentRecursive(comments, commentId))
    }

    return (
        <div className="mt-6 rounded-2xl border border-white/[0.04] bg-[#0c0c0e] p-6">
            <h3 className="text-sm font-medium text-white/70 mb-5 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-white/40" strokeWidth={1.5} />
                {t.comments.title} ({commentsCount})
            </h3>

            {/* Add Comment Form */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="flex gap-3">
                        <Avatar className="h-9 w-9 border border-white/[0.08]">
                            <AvatarImage src={user?.avatar || "/developer-avatar.png"} />
                            <AvatarFallback className="bg-white/[0.04] text-white/40 text-xs">{user?.username?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                            <Textarea
                                placeholder={t.comments.writePlaceholder}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="min-h-20 resize-none bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.12] focus-visible:ring-0 rounded-xl"
                                disabled={submitting}
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={submitting || !newComment.trim()}
                                    className="gap-2 bg-white text-black hover:bg-white/90 rounded-xl font-medium"
                                >
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" strokeWidth={2} />
                                            {t.comments.send}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                    <p className="text-sm text-white/40 mb-3">{t.comments.loginPrompt}</p>
                    <Link href="/login">
                        <Button variant="outline" size="sm" className="bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05] rounded-lg">
                            {t.comments.login}
                        </Button>
                    </Link>
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-white/30" />
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-sm text-white/30">{t.comments.noneYet}</p>
                    <p className="text-xs text-white/20 mt-1">{t.comments.beFirst}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            postId={postId}
                            onReplyAdded={handleReplyAdded}
                            onCommentDeleted={handleCommentDeleted}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
