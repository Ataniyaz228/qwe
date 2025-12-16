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
    if (diffMins < 60) return `${diffMins} мин назад`
    if (diffHours < 24) return `${diffHours}ч назад`
    if (diffDays < 7) return `${diffDays}д назад`

    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
}

// Компонент одного комментария
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
            toast.success('Комментарий удалён')
        } catch (err) {
            toast.error('Ошибка удаления')
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
            toast.success("Ответ добавлен!")
        } catch (err) {
            toast.error("Ошибка отправки ответа")
        } finally {
            setSubmitting(false)
        }
    }

    const hasReplies = comment.replies && comment.replies.length > 0

    return (
        <div className={`${isNested ? "" : "p-4 rounded-lg bg-secondary/30"}`}>
            <div className="flex gap-3">
                <Link href={`/user/${comment.author.username}`}>
                    <Avatar className={isNested ? "h-7 w-7" : "h-9 w-9"}>
                        <AvatarImage src={comment.author.avatar || "/developer-avatar.png"} />
                        <AvatarFallback>
                            {comment.author.display_name?.[0] || comment.author.username[0]}
                        </AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Link
                            href={`/user/${comment.author.username}`}
                            className="text-sm font-medium hover:underline"
                        >
                            {comment.author.display_name || comment.author.username}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                            @{comment.author.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            · {formatTimeAgo(comment.created_at)}
                        </span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>

                    {/* Кнопки действий */}
                    <div className="flex items-center gap-2 mt-2">
                        {depth < maxDepth && isAuthenticated && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => setShowReplyForm(!showReplyForm)}
                            >
                                <Reply className="h-3 w-3 mr-1" />
                                Ответить
                            </Button>
                        )}
                        {hasReplies && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => setShowReplies(!showReplies)}
                            >
                                {showReplies ? (
                                    <ChevronUp className="h-3 w-3 mr-1" />
                                ) : (
                                    <ChevronDown className="h-3 w-3 mr-1" />
                                )}
                                {comment.replies_count} {comment.replies_count === 1 ? 'ответ' : 'ответов'}
                            </Button>
                        )}
                        {isOwner && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <>
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Удалить
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Форма ответа */}
                    {showReplyForm && (
                        <div className="mt-3 flex gap-2">
                            <Avatar className="h-7 w-7">
                                <AvatarImage src={user?.avatar || "/developer-avatar.png"} />
                                <AvatarFallback>{user?.username?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <Textarea
                                    placeholder={`Ответить @${comment.author.username}...`}
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    className="min-h-16 resize-none text-sm"
                                    disabled={submitting}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => { setShowReplyForm(false); setReplyContent("") }}
                                    >
                                        Отмена
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleReply}
                                        disabled={submitting || !replyContent.trim()}
                                    >
                                        {submitting ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            "Ответить"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ответы */}
                    {hasReplies && showReplies && (
                        <div className="mt-3 ml-4 border-l-2 border-border pl-4 space-y-3">
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
            toast.error("Войдите, чтобы оставить комментарий")
            return
        }

        if (!newComment.trim()) {
            toast.error("Комментарий не может быть пустым")
            return
        }

        setSubmitting(true)
        try {
            const comment = await postsAPI.addComment(postId, newComment.trim())
            setComments([...comments, comment])
            setNewComment("")
            toast.success("Комментарий добавлен!")
        } catch (err) {
            toast.error("Ошибка добавления комментария")
        } finally {
            setSubmitting(false)
        }
    }

    // Рекурсивно добавляем ответ в нужный комментарий
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

    // Рекурсивно удаляем комментарий
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
        <div className="mt-6 rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Комментарии ({commentsCount})
            </h3>

            {/* Форма добавления комментария */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="flex gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.avatar || "/developer-avatar.png"} />
                            <AvatarFallback>{user?.username?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <Textarea
                                placeholder="Напишите комментарий..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="min-h-20 resize-none"
                                disabled={submitting}
                            />
                            <div className="flex justify-end">
                                <Button type="submit" size="sm" disabled={submitting || !newComment.trim()}>
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-1" />
                                            Отправить
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-6 p-4 rounded-lg bg-secondary/50 text-center">
                    <p className="text-muted-foreground mb-2">Войдите, чтобы оставить комментарий</p>
                    <Link href="/login">
                        <Button variant="outline" size="sm">Войти</Button>
                    </Link>
                </div>
            )}

            {/* Список комментариев */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                    Пока нет комментариев. Будьте первым!
                </p>
            ) : (
                <div className="space-y-4">
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
