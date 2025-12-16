"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usersAPI, postsAPI, type User, type Post } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import {
    Loader2,
    MapPin,
    Link as LinkIcon,
    Github,
    Twitter,
    Calendar,
    UserPlus,
    UserMinus,
    CheckCircle2,
    Code,
    Heart,
    Eye,
    MessageCircle
} from "lucide-react"
import { toast } from "sonner"
import { CodeHighlight } from "@/components/code-highlight"

// Цвета языков
const languageColors: Record<string, string> = {
    javascript: "bg-yellow-500/20 text-yellow-400",
    typescript: "bg-blue-500/20 text-blue-400",
    python: "bg-green-500/20 text-green-400",
    rust: "bg-orange-500/20 text-orange-400",
    go: "bg-cyan-500/20 text-cyan-400",
    java: "bg-red-500/20 text-red-400",
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
    })
}

export default function UserProfilePage() {
    const params = useParams()
    const username = params.username as string
    const { user: currentUser, isAuthenticated } = useAuth()

    const [user, setUser] = useState<User | null>(null)
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [followLoading, setFollowLoading] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)

    const isOwnProfile = currentUser?.username === username

    useEffect(() => {
        loadUserData()
    }, [username])

    const loadUserData = async () => {
        setLoading(true)
        try {
            const [userData, postsData] = await Promise.all([
                usersAPI.getProfile(username),
                usersAPI.getPosts(username)
            ])
            setUser(userData)
            setIsFollowing(userData.is_following || false)
            setPosts(Array.isArray(postsData) ? postsData : postsData.results || [])
        } catch (err) {
            console.error("Error loading user profile:", err)
            toast.error("Ошибка загрузки профиля")
        } finally {
            setLoading(false)
        }
    }

    const handleFollow = async () => {
        if (!isAuthenticated) {
            toast.error("Войдите, чтобы подписаться")
            return
        }

        const wasFollowing = isFollowing

        setFollowLoading(true)
        try {
            if (wasFollowing) {
                await usersAPI.unfollow(username)
                toast.success("Вы отписались")
            } else {
                await usersAPI.follow(username)
                toast.success("Вы подписались")
            }
        } catch (err) {
            // Ошибки типа "уже подписан" или "не подписан" игнорируем
            // UI просто синхронизируется с сервером
            console.log("Follow/unfollow handled:", err)
        }

        // Всегда перезагружаем данные чтобы синхронизировать UI
        try {
            const userData = await usersAPI.getProfile(username)
            setUser(userData)
            setIsFollowing(userData.is_following || false)
        } catch {
            // ignore reload error
        }
        setFollowLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 md:ml-16 lg:ml-56 flex items-center justify-center min-h-[60vh]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </main>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 md:ml-16 lg:ml-56 flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold mb-2">Пользователь не найден</h1>
                            <p className="text-muted-foreground">@{username}</p>
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
                    <div className="max-w-4xl mx-auto p-4 md:p-6">
                        {/* Profile Header */}
                        <div className="rounded-xl border border-border bg-card overflow-hidden mb-6">
                            {/* Banner */}
                            <div className="h-32 bg-gradient-to-r from-primary/30 via-primary/20 to-secondary/30" />

                            {/* Profile Info */}
                            <div className="px-6 pb-6">
                                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                                    <Avatar className="h-24 w-24 border-4 border-background">
                                        <AvatarImage src={user.avatar || "/developer-avatar.png"} />
                                        <AvatarFallback className="text-2xl">
                                            {(user.display_name || user.username)?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 sm:pb-2">
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-2xl font-bold">{user.display_name || user.username}</h1>
                                            {user.is_verified && (
                                                <CheckCircle2 className="h-5 w-5 text-primary fill-primary" />
                                            )}
                                        </div>
                                        <p className="text-muted-foreground">@{user.username}</p>
                                    </div>

                                    {!isOwnProfile && (
                                        <Button
                                            onClick={handleFollow}
                                            disabled={followLoading}
                                            variant={isFollowing ? "outline" : "default"}
                                            className="gap-2"
                                        >
                                            {followLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : isFollowing ? (
                                                <>
                                                    <UserMinus className="h-4 w-4" />
                                                    Отписаться
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="h-4 w-4" />
                                                    Подписаться
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    {isOwnProfile && (
                                        <Button variant="outline" asChild>
                                            <Link href="/settings">Редактировать профиль</Link>
                                        </Button>
                                    )}
                                </div>

                                {/* Bio */}
                                {user.bio && (
                                    <p className="mt-4 text-sm">{user.bio}</p>
                                )}

                                {/* Stats & Links */}
                                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    {user.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {user.location}
                                        </span>
                                    )}
                                    {user.website && (
                                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                                            <LinkIcon className="h-4 w-4" />
                                            {new URL(user.website).hostname}
                                        </a>
                                    )}
                                    {user.github_username && (
                                        <a href={`https://github.com/${user.github_username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                                            <Github className="h-4 w-4" />
                                            {user.github_username}
                                        </a>
                                    )}
                                    {user.twitter_username && (
                                        <a href={`https://twitter.com/${user.twitter_username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                                            <Twitter className="h-4 w-4" />
                                            @{user.twitter_username}
                                        </a>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Присоединился {formatDate(user.date_joined || new Date().toISOString())}
                                    </span>
                                </div>

                                {/* Counters */}
                                <div className="mt-4 flex gap-6">
                                    <div className="text-center">
                                        <div className="text-xl font-bold">{user.posts_count || 0}</div>
                                        <div className="text-xs text-muted-foreground">постов</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold">{user.followers_count || 0}</div>
                                        <div className="text-xs text-muted-foreground">подписчиков</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold">{user.following_count || 0}</div>
                                        <div className="text-xs text-muted-foreground">подписок</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Posts */}
                        <div className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="px-6 py-4 border-b border-border">
                                <h2 className="font-semibold flex items-center gap-2">
                                    <Code className="h-4 w-4" />
                                    Посты ({posts.length})
                                </h2>
                            </div>

                            {posts.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Code className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>Пока нет постов</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {posts.map((post) => (
                                        <Link
                                            key={post.id}
                                            href={`/post/${post.id}`}
                                            className="block p-4 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium truncate">{post.title}</h3>
                                                    <p className="text-sm text-muted-foreground truncate mt-1">
                                                        {post.description || post.filename}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                        <Badge variant="outline" className={`text-xs ${languageColors[post.language] || ""}`}>
                                                            {post.language}
                                                        </Badge>
                                                        <span className="flex items-center gap-1">
                                                            <Heart className="h-3 w-3" />
                                                            {post.likes_count || 0}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MessageCircle className="h-3 w-3" />
                                                            {post.comments_count || 0}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="h-3 w-3" />
                                                            {post.views || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
