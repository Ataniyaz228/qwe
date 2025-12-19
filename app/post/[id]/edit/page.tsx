"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { usePost } from "@/hooks/usePosts"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Loader2, Save, History, AlertCircle, GitCommit, Sparkles, FileCode } from "lucide-react"
import { toast } from "sonner"
import { postsAPI, type PostRevision } from "@/lib/api"
import { generateCommitMessage } from "@/lib/n8n"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { cn } from "@/lib/utils"

function formatDate(dateString: string, lang: string): string {
    return new Date(dateString).toLocaleDateString(lang === 'kk' ? 'kk-KZ' : 'ru-RU', {
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
    const { t, language } = useLanguage()

    const [title, setTitle] = useState("")
    const [code, setCode] = useState("")
    const [description, setDescription] = useState("")
    const [commitMessage, setCommitMessage] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [mounted, setMounted] = useState(false)

    const [revisions, setRevisions] = useState<PostRevision[]>([])
    const [loadingRevisions, setLoadingRevisions] = useState(false)

    // Original code for comparison - use useRef to preserve initial value
    const originalCodeRef = useRef<string>("")
    const isOriginalCodeSet = useRef(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Load post data into form - set originalCode only ONCE
    useEffect(() => {
        if (post) {
            setTitle(post.title)
            setCode(post.code || "")
            setDescription(post.description || "")

            // Only set original code once, on first load
            if (!isOriginalCodeSet.current) {
                originalCodeRef.current = post.code || ""
                isOriginalCodeSet.current = true
            }
        }
    }, [post])

    // Load revision history
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
            console.error("Error loading revisions:", err)
        } finally {
            setLoadingRevisions(false)
        }
    }

    // AI Generate Commit Message
    const handleGenerateCommit = async () => {
        if (!code.trim()) {
            toast.error(t.n8n.noCode)
            return
        }

        // Always compare with the original code from when page loaded
        const prevCode = originalCodeRef.current

        // Check if there are actual changes
        if (code.trim() === prevCode.trim()) {
            toast.error("Нет изменений для генерации коммита")
            return
        }

        setIsGenerating(true)
        try {
            const response = await generateCommitMessage({
                oldCode: prevCode,
                newCode: code,
                language: post?.language || 'text',
                title: title,
                description: description,
            })

            if (response.success && response.commitMessage) {
                setCommitMessage(response.commitMessage)
                toast.success(t.n8n.generated)
            } else {
                toast.error(response.error || t.n8n.generateError)
            }
        } catch (err) {
            console.error("Generate commit error:", err)
            toast.error(t.n8n.generateError)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSave = async () => {
        if (!title.trim() || !code.trim()) {
            toast.error(t.editPost.requiredFields)
            return
        }

        setIsSaving(true)
        try {
            await postsAPI.edit(postId, {
                title: title.trim(),
                code: code.trim(),
                description: description.trim(),
                commit_message: commitMessage.trim() || "Update post"
            })
            toast.success(t.editPost.saved)
            router.push(`/post/${postId}`)
        } catch (err) {
            toast.error(t.editPost.saveError)
        } finally {
            setIsSaving(false)
        }
    }

    const restoreRevision = (revision: PostRevision) => {
        setTitle(revision.title)
        setCode(revision.code)
        setDescription(revision.description)
        setCommitMessage(`${t.editPost.restoredFrom} v${revision.revision_number}`)
        toast.success(`${t.editPost.restoredFrom} v${revision.revision_number}`)
    }

    // Check authorization
    const isAuthor = user && post && user.username === post.author.username

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#09090b]">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                        </div>
                        <p className="text-sm text-white/30">{t.common.loading}</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-[#09090b]">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                        <AlertCircle className="h-7 w-7 text-red-400" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-semibold text-white/80 mb-2">{t.editPost.postNotFound}</h2>
                    <Link href="/feed">
                        <Button variant="outline" className="mt-4 bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05]">
                            {t.pages.post.back}
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    if (!isAuthor) {
        return (
            <div className="min-h-screen bg-[#09090b]">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                        <AlertCircle className="h-7 w-7 text-red-400" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-semibold text-white/80 mb-2">{t.editPost.noAccess}</h2>
                    <p className="text-white/40 mb-4">{t.editPost.onlyAuthorCanEdit}</p>
                    <Link href={`/post/${postId}`}>
                        <Button variant="outline" className="bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05]">
                            {t.editPost.backToPost}
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#09090b]">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-white/[0.008] rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-white/[0.008] rounded-full blur-[150px]" />
            </div>

            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 md:ml-16 lg:ml-56 relative z-10">
                    <div className="mx-auto max-w-4xl px-4 py-6 pb-24 md:pb-6">
                        {/* Header */}
                        <div className={cn(
                            "flex items-center justify-between mb-6 transition-all duration-500",
                            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                        )}>
                            <Link
                                href={`/post/${postId}`}
                                className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
                            >
                                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all">
                                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                                </div>
                                {t.editPost.backToPost}
                            </Link>
                        </div>

                        {/* Title */}
                        <div className={cn(
                            "flex items-center gap-3 mb-6 transition-all duration-500 delay-100",
                            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                        )}>
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/[0.08] flex items-center justify-center">
                                <FileCode className="h-5 w-5 text-white/50" strokeWidth={1.5} />
                            </div>
                            <h1 className="text-xl font-semibold text-white/90">{t.editPost.title}</h1>
                        </div>

                        <Tabs defaultValue="edit" className="space-y-6">
                            <TabsList className="bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl">
                                <TabsTrigger value="edit" className="rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white/90 text-white/50">
                                    {t.editPost.editing}
                                </TabsTrigger>
                                <TabsTrigger value="history" className="gap-1.5 rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white/90 text-white/50">
                                    <History className="h-4 w-4" strokeWidth={1.5} />
                                    {t.editPost.history} ({revisions.length})
                                </TabsTrigger>
                            </TabsList>

                            {/* Edit Tab */}
                            <TabsContent value="edit" className="space-y-5">
                                <div className={cn(
                                    "p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-5 transition-all duration-500 delay-200",
                                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                                )}>
                                    {/* Title */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-xs text-white/50">{t.editPost.titleLabel}</Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder={t.editPost.titlePlaceholder}
                                            className="h-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.12] focus-visible:ring-0 rounded-xl"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-xs text-white/50">{t.editPost.descriptionLabel}</Label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder={t.editPost.descriptionPlaceholder}
                                            className="min-h-20 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.12] focus-visible:ring-0 rounded-xl resize-none"
                                        />
                                    </div>

                                    {/* Code */}
                                    <div className="space-y-2">
                                        <Label htmlFor="code" className="text-xs text-white/50">{t.editPost.codeLabel}</Label>
                                        <Textarea
                                            id="code"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            placeholder={t.editPost.codePlaceholder}
                                            className="min-h-60 font-mono text-sm bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.12] focus-visible:ring-0 rounded-xl resize-none"
                                        />
                                    </div>

                                    {/* Commit Message with AI Generate Button */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="commit" className="text-xs text-white/50">{t.editPost.commitMessageLabel}</Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleGenerateCommit}
                                                disabled={isGenerating || !code.trim()}
                                                className="gap-1.5 h-7 text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg"
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        {t.n8n.generating}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="h-3 w-3" strokeWidth={2} />
                                                        {t.n8n.generateCommit}
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <Input
                                            id="commit"
                                            value={commitMessage}
                                            onChange={(e) => setCommitMessage(e.target.value)}
                                            placeholder={t.editPost.commitMessagePlaceholder}
                                            className="h-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.12] focus-visible:ring-0 rounded-xl"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => router.back()}
                                            className="bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.05] hover:text-white/70 rounded-xl"
                                        >
                                            {t.editPost.cancel}
                                        </Button>
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="gap-1.5 bg-white text-black hover:bg-white/90 rounded-xl font-medium"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" strokeWidth={2} />
                                            )}
                                            {t.editPost.save}
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* History Tab */}
                            <TabsContent value="history">
                                <div className={cn(
                                    "p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] transition-all duration-500",
                                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                                )}>
                                    <h3 className="text-lg font-semibold text-white/80 mb-4 flex items-center gap-2">
                                        <GitCommit className="h-5 w-5 text-white/40" strokeWidth={1.5} />
                                        {t.editPost.historyTitle}
                                    </h3>

                                    {loadingRevisions ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-white/40" />
                                        </div>
                                    ) : revisions.length === 0 ? (
                                        <p className="text-white/40 text-center py-8">
                                            {t.editPost.historyEmpty}
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {revisions.map((revision) => (
                                                <div
                                                    key={revision.id}
                                                    className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                                                >
                                                    <div className="flex-shrink-0 mt-1">
                                                        <div className="h-7 w-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-semibold text-white/60">
                                                            v{revision.revision_number}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Avatar className="h-5 w-5">
                                                                <AvatarImage src={revision.author.avatar || ""} />
                                                                <AvatarFallback className="text-[10px] bg-white/[0.06] text-white/60">
                                                                    {revision.author.username[0].toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm font-medium text-white/70">{revision.author.username}</span>
                                                            <span className="text-xs text-white/30">
                                                                {formatDate(revision.created_at, language)}
                                                            </span>
                                                        </div>
                                                        {revision.commit_message && (
                                                            <p className="text-sm text-white/50">{revision.commit_message}</p>
                                                        )}
                                                        <p className="text-xs text-white/30 mt-1 truncate">
                                                            {revision.title}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => restoreRevision(revision)}
                                                        className="bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.05] hover:text-white/70 rounded-lg text-xs"
                                                    >
                                                        {t.editPost.restore}
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

