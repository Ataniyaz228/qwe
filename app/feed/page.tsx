"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Widgets } from "@/components/widgets"
import { APIPostCard } from "@/components/api-post-card"
import { usePosts } from "@/hooks/usePosts"
import { Loader2, FileCode, Plus, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"

export default function FeedPage() {
  const { posts, isLoading, error, refresh, hasMore, loadMore } = usePosts()
  const { t } = useLanguage()
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    await loadMore()
    setIsLoadingMore(false)
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-white/[0.008] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/[0.008] rounded-full blur-[150px]" />
      </div>

      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56 relative z-10">
          <div className="mx-auto max-w-7xl px-4 py-6 pb-20 md:pb-6">
            <div className="flex gap-6">
              {/* Feed */}
              <div className="flex-1 max-w-2xl flex flex-col gap-4">
                {/* Header */}
                <div className={cn(
                  "flex items-center justify-between mb-2 transition-all duration-500",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                )}>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white/50" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h1 className="text-lg font-semibold text-white/90">{t.feed.title}</h1>
                      <p className="text-xs text-white/30">{t.feed.subtitle}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refresh}
                    disabled={isLoading}
                    className="gap-1.5 text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg"
                  >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} strokeWidth={1.5} />
                    <span className="hidden sm:inline">{t.feed.refresh}</span>
                  </Button>
                </div>

                {/* Loading */}
                {isLoading && posts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                      <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                    </div>
                    <p className="text-sm text-white/30">{t.feed.loadingPosts}</p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
                      <p className="text-red-400 text-sm">{error.message}</p>
                    </div>
                    <Button
                      onClick={refresh}
                      variant="outline"
                      className="bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05] hover:text-white/80"
                    >
                      {t.feed.tryAgain}
                    </Button>
                  </div>
                )}

                {/* Empty */}
                {!isLoading && !error && posts.length === 0 && (
                  <div className={cn(
                    "flex flex-col items-center justify-center py-20 text-center transition-all duration-700",
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  )}>
                    <div className="h-16 w-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
                      <FileCode className="h-7 w-7 text-white/40" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-medium text-white/80 mb-2">{t.feed.noPosts}</h3>
                    <p className="text-sm text-white/35 mb-6 max-w-xs">
                      {t.feed.beFirst}
                    </p>
                    <Link href="/new">
                      <Button className="gap-1.5 bg-white text-black hover:bg-white/90 rounded-xl font-medium">
                        <Plus className="h-4 w-4" strokeWidth={2} />
                        {t.feed.createPost}
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Posts */}
                <div className="space-y-4">
                  {posts.map((post, i) => (
                    <div
                      key={post.id}
                      className={cn(
                        "transition-all duration-500",
                        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                      )}
                      style={{ transitionDelay: `${Math.min(i * 50, 300)}ms` }}
                    >
                      <APIPostCard post={post} />
                    </div>
                  ))}
                </div>

                {/* Load More */}
                {hasMore && posts.length > 0 && (
                  <div className="flex justify-center py-6">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="gap-2 bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.05] hover:text-white/70 hover:border-white/[0.1] rounded-xl"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t.feed.loading}
                        </>
                      ) : (
                        t.feed.showMore
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Widgets */}
              <Widgets />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
