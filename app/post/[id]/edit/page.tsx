"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { usePost } from "@/hooks/usePosts"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Loader2, Save, History, AlertCircle, GitCommit } from "lucide-react"
import { toast } from "sonner"
import { postsAPI, type PostRevision } from "@/lib/api"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
}

function EditPostContent() {
    const params = useParams()
    const router = useRouter()
    const postId = params.id as string
    const { post, isLoading, error } = usePost(postId)
    const { user } = useAuth()

    const [title, setTitle] = useState("")
    const [code, setCode] = useState("")
    const [description, setDescription] = useState("")
    const [commitMessage, setCommitMessage] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    const [revisions, setRevisions] = useState<PostRevision[]>([])
    const [loadingRevisions, setLoadingRevisions] = useState(false)
    const [selectedRevision, setSelectedRevision] = useState<PostRevision | null>(null)

    // Загружаем данные поста в форму
    useEffect(() => {
        if (post) {
            setTitle(post.title)
            setCode(post.code || "")
            setDescription(post.description || "")
        }
    }, [post])

    // Загружаем историю изменений
    useEffect(() => {
        if (postId) {
            loadRevisions()
        }
    }, [postId])

    const loadRevisions = async () => {
        setLoadingRevisions(true)
        try {
            const data = await postsAPI.getRevisions(postId)
            setRevisions(data)
        } catch (err) {
            console.error("Ошибка загрузки ревизий:", err)
        } finally {
            setLoadingRevisions(false)
        }
    }

    const handleSave = async () => {
        if (!title.trim() || !code.trim()) {
            toast.error("Заполните обязательные поля")
            return
        }

        setIsSaving(true)
        try {
            await postsAPI.edit(postId, {
                title: title.trim(),
                code: code.trim(),
                description: description.trim(),
                commit_message: commitMessage.trim() || "Обновление поста"
            })
            toast.success("Пост обновлён!")
            router.push(`/post/${postId}`)
        } catch (err) {
            toast.error("Ошибка сохранения")
        } finally {
            setIsSaving(false)
        }
    }

    const restoreRevision = (revision: PostRevision) => {
        setTitle(revision.title)
        setCode(revision.code)
        setDescription(revision.description)
        setCommitMessage(`Восстановлено из ревизии v${revision.revision_number}`)
        setSelectedRevision(null)
        toast.success(`Восстановлено из ревизии v${revision.revision_number}`)
    }

    // Проверка авторизации
    const isAuthor = user && post && user.username === post.author.username

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-xl font-bold">Пост не найден</h2>
                    <Link href="/feed">
                        <Button variant="outline" className="mt-4">Вернуться</Button>
                    </Link>
                </div>
            </div>
        )
    }

    if (!isAuthor) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-xl font-bold">Нет доступа</h2>
                    <p className="text-muted-foreground mb-4">Вы можете редактировать только свои посты</p>
                    <Link href={`/post/${postId}`}>
                        <Button variant="outline">Назад к посту</Button>
                    </Link>
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
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <Link
                                href={`/post/${postId}`}
                                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Назад к посту
                            </Link>
                        </div>

                        <h1 className="text-2xl font-bold mb-6">Редактирование поста</h1>

                        <Tabs defaultValue="edit" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="edit">Редактирование</TabsTrigger>
                                <TabsTrigger value="history" className="gap-1">
                                    <History className="h-4 w-4" />
                                    История ({revisions.length})
                                </TabsTrigger>
                            </TabsList>

                            {/* Редактирование */}
                            <TabsContent value="edit" className="space-y-6">
                                <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Заголовок *</Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Название поста"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Описание</Label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Краткое описание"
                                            className="min-h-20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="code">Код *</Label>
                                        <Textarea
                                            id="code"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            placeholder="Ваш код..."
                                            className="min-h-60 font-mono text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="commit">Сообщение об изменении</Label>
                                        <Input
                                            id="commit"
                                            value={commitMessage}
                                            onChange={(e) => setCommitMessage(e.target.value)}
                                            placeholder="Что было изменено? (опционально)"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button variant="outline" onClick={() => router.back()}>
                                            Отмена
                                        </Button>
                                        <Button onClick={handleSave} disabled={isSaving} className="gap-1">
                                            {isSaving ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Сохранить
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* История изменений */}
                            <TabsContent value="history">
                                <div className="rounded-lg border border-border bg-card p-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <GitCommit className="h-5 w-5" />
                                        История изменений
                                    </h3>

                                    {loadingRevisions ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        </div>
                                    ) : revisions.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">
                                            История изменений пока пуста
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {revisions.map((revision) => (
                                                <div
                                                    key={revision.id}
                                                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
                                                >
                                                    <div className="flex-shrink-0 mt-1">
                                                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                                            v{revision.revision_number}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Avatar className="h-5 w-5">
                                                                <AvatarImage src={revision.author.avatar || ""} />
                                                                <AvatarFallback className="text-xs">
                                                                    {revision.author.username[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm font-medium">{revision.author.username}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDate(revision.created_at)}
                                                            </span>
                                                        </div>
                                                        {revision.commit_message && (
                                                            <p className="text-sm text-muted-foreground">{revision.commit_message}</p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {revision.title}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => restoreRevision(revision)}
                                                    >
                                                        Восстановить
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default function EditPostPage() {
    return (
        <ProtectedRoute>
            <EditPostContent />
        </ProtectedRoute>
    )
}
