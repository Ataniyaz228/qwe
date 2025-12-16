"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Widgets } from "@/components/widgets"
import { APIPostCard } from "@/components/api-post-card"
import { usePosts } from "@/hooks/usePosts"
import { Loader2, FileCode, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FeedPage() {
  const { posts, isLoading, error, refresh, hasMore, loadMore } = usePosts()
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    await loadMore()
    setIsLoadingMore(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56">
          <div className="mx-auto max-w-7xl px-4 py-6 pb-20 md:pb-6">
            <div className="flex gap-6">
              {/* Feed */}
              <div className="flex-1 max-w-2xl flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-xl font-bold">Лента</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refresh}
                    disabled={isLoading}
                    className="gap-1"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Обновить
                  </Button>
                </div>

                {/* Loading State */}
                {isLoading && posts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>Загрузка постов...</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <p className="text-destructive mb-4">{error.message}</p>
                    <Button onClick={refresh} variant="outline">
                      Попробовать снова
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && posts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <FileCode className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Пока нет постов</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Станьте первым, кто поделится кодом с сообществом!
                    </p>
                    <Link href="/new">
                      <Button className="gap-1">
                        <Plus className="h-4 w-4" />
                        Создать пост
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Posts List */}
                {posts.map((post) => (
                  <APIPostCard key={post.id} post={post} />
                ))}

                {/* Load More */}
                {hasMore && posts.length > 0 && (
                  <div className="flex justify-center py-4">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="gap-2"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Загрузка...
                        </>
                      ) : (
                        "Показать ещё"
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Widgets */}
              <Widgets />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
