"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { usersAPI, type User, type Post } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import {
    Loader2,
    MapPin,
    Link as LinkIcon,
    Github,
    Calendar,
    UserPlus,
    UserMinus,
    Code2,
    Heart,
    Eye,
    MessageSquare,
    Settings,
    FileCode,
    Users,
    Zap,
    ExternalLink,
    UserX
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const languageColors: Record<string, string> = {
    javascript: "bg-yellow-400",
    typescript: "bg-blue-400",
    python: "bg-green-400",
    rust: "bg-orange-400",
    go: "bg-cyan-400",
    java: "bg-red-400",
    csharp: "bg-purple-400",
    cpp: "bg-pink-400",
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("ru-RU", {
        month: "long",
        year: "numeric"
    })
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
                className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.03] transition-all duration-300 cursor-pointer"
                style={{
                    animationDelay: `${index * 60}ms`,
                    animation: 'fadeSlideUp 0.4s ease-out forwards',
                    opacity: 0,
                    transform: 'translateY(10px)'
                }}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={cn("h-2 w-2 rounded-full", langColor)} />
                            <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">{post.language}</span>
                        </div>
                        <h3 className="font-medium text-white/80 group-hover:text-white transition-colors">
                            {post.title || post.filename}
                        </h3>
                        <p className="text-xs text-white/35 mt-1 line-clamp-2">
                            {post.description || noDescription}
                        </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-4 w-4 text-white/30" strokeWidth={1.5} />
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.04] text-[10px] text-white/25">
                    <span className={cn("flex items-center gap-1", post.is_liked && "text-rose-400")}>
                        <Heart className={cn("h-3.5 w-3.5", post.is_liked && "fill-current")} strokeWidth={1.5} />
                        {post.likes_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {post.comments_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {post.views || 0}
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default function UserProfilePage() {
    const params = useParams()
    const username = params.username as string
    const { user: currentUser, isAuthenticated } = useAuth()
    const { t } = useLanguage()

    const [user, setUser] = useState<User | null>(null)
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [followLoading, setFollowLoading] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)
    const [mounted, setMounted] = useState(false)

    const isOwnProfile = currentUser?.username === username

    useEffect(() => {
        setMounted(true)
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
            console.log("Follow/unfollow handled:", err)
        }

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
            <div className="min-h-screen bg-[#09090b]">
                <Navbar />
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 md:ml-16 lg:ml-56 flex items-center justify-center min-h-[60vh]">
                        <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center animate-pulse">
                            <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#09090b]">
                <Navbar />
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 md:ml-16 lg:ml-56 flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                                <UserX className="h-7 w-7 text-white/20" strokeWidth={1} />
                            </div>
                            <h1 className="text-lg font-medium text-white/70 mb-1">{t.pages.user.userNotFound}</h1>
                            <p className="text-sm text-white/30">@{username}</p>
                        </div>
                    </main>
                </div>
            </div>
        )
    }

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
            `}</style>

            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 md:ml-16 lg:ml-56 relative z-10">
                    <div className="max-w-4xl mx-auto p-4 md:p-6">

                        {/* Profile Header */}
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
                            </div>

                            <div className="px-6 pb-6 -mt-14 relative">
                                <div className="flex flex-col sm:flex-row gap-5">
                                    {/* Avatar */}
                                    <div className="relative group">
                                        <div className="absolute inset-0 rounded-full bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <Avatar className="h-28 w-28 border-4 border-[#0c0c0e] ring-2 ring-white/[0.1] transition-all duration-500 group-hover:ring-white/[0.2]">
                                            <AvatarImage src={user.avatar || "/developer-avatar.png"} />
                                            <AvatarFallback className="bg-white/[0.04] text-white/40 text-2xl">
                                                {(user.display_name || user.username)?.[0]?.toUpperCase()}
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

                                            {!isOwnProfile ? (
                                                <Button
                                                    onClick={handleFollow}
                                                    disabled={followLoading}
                                                    className={cn(
                                                        "gap-2 rounded-xl transition-all duration-300",
                                                        isFollowing
                                                            ? "bg-white/[0.03] border border-white/[0.08] text-white/60 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                                                            : "bg-white text-black hover:bg-white/90"
                                                    )}
                                                >
                                                    {followLoading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : isFollowing ? (
                                                        <>
                                                            <UserMinus className="h-4 w-4" strokeWidth={1.5} />
                                                            {t.pages.user.unfollow}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserPlus className="h-4 w-4" strokeWidth={2} />
                                                            {t.pages.user.follow}
                                                        </>
                                                    )}
                                                </Button>
                                            ) : (
                                                <Link href="/settings">
                                                    <Button className="gap-2 bg-white text-black hover:bg-white/90 rounded-xl font-medium transition-all duration-300 hover:scale-105">
                                                        <Settings className="h-4 w-4" strokeWidth={2} />
                                                        {t.pages.user.settings}
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>

                                        {user.bio && (
                                            <p className="mt-4 text-sm text-white/50 leading-relaxed max-w-lg">{user.bio}</p>
                                        )}

                                        {/* Meta Links */}
                                        <div className="flex flex-wrap gap-5 mt-5 text-xs">
                                            {user.location && (
                                                <span className="flex items-center gap-1.5 text-white/30">
                                                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                    {user.location}
                                                </span>
                                            )}
                                            {user.website && (
                                                <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors group">
                                                    <LinkIcon className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" strokeWidth={1.5} />
                                                    {new URL(user.website).hostname}
                                                </a>
                                            )}
                                            {user.github_username && (
                                                <a href={`https://github.com/${user.github_username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors group">
                                                    <Github className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" strokeWidth={1.5} />
                                                    {user.github_username}
                                                </a>
                                            )}
                                            <span className="flex items-center gap-1.5 text-white/30">
                                                <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                С {formatDate(user.date_joined || new Date().toISOString())}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className={cn(
                            "grid grid-cols-3 gap-2 mb-6 transition-all duration-700 delay-100",
                            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                        )}>
                            {[
                                { label: t.pages.user.posts, value: user.posts_count || 0, icon: FileCode },
                                { label: t.pages.user.followers, value: user.followers_count || 0, icon: Users },
                                { label: t.pages.user.following, value: user.following_count || 0, icon: UserPlus },
                            ].map((stat, i) => (
                                <div
                                    key={stat.label}
                                    className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] text-center transition-all duration-300 hover:-translate-y-1"
                                >
                                    <stat.icon className="h-4 w-4 mx-auto mb-2 text-white/20 group-hover:text-white/40 transition-colors" strokeWidth={1.5} />
                                    <p className="text-xl font-medium text-white/70 group-hover:text-white/90 transition-colors">{stat.value}</p>
                                    <p className="text-[10px] text-white/25">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Posts Section */}
                        <div className={cn(
                            "transition-all duration-700 delay-200",
                            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                        )}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                                    <Code2 className="h-4 w-4 text-white/40" strokeWidth={1.5} />
                                </div>
                                <h2 className="text-sm font-medium text-white/60">{t.pages.user.postsTab} ({posts.length})</h2>
                            </div>

                            {posts.length === 0 ? (
                                <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-b from-white/[0.02] to-transparent p-16 text-center">
                                    <div className="h-16 w-16 mx-auto mb-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                                        <Code2 className="h-7 w-7 text-white/20" strokeWidth={1} />
                                    </div>
                                    <h3 className="font-medium text-white/60 mb-2">{t.pages.user.noPosts}</h3>
                                    <p className="text-sm text-white/30">{t.pages.user.userHasNoPosts}</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {posts.map((post, i) => (
                                        <PostCard key={post.id} post={post} index={i} noDescription={t.pages.user.noDescription} />
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
