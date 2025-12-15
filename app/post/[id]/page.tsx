import type React from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageSquare, Share2, Bookmark, GitFork, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ReactHookSample, PythonAsyncSample, TypeScriptAPISample } from "@/components/code-samples"

const posts: Record<
  string,
  {
    filename: string
    language: string
    author: { name: string; username: string; avatar: string }
    timestamp: string
    code: React.ReactNode
    likes: number
    comments: number
    forks: number
    tags: string[]
    description: string
  }
> = {
  "1": {
    filename: "useDebounce.ts",
    language: "TypeScript",
    author: {
      name: "Sarah Chen",
      username: "sarahcodes",
      avatar: "/female-developer-avatar.png",
    },
    timestamp: "2h ago",
    code: <ReactHookSample />,
    likes: 234,
    comments: 18,
    forks: 45,
    tags: ["react", "hooks", "typescript", "performance"],
    description:
      "A custom React hook for debouncing values. Perfect for search inputs and form fields where you want to delay API calls until the user stops typing.",
  },
  "2": {
    filename: "async_fetcher.py",
    language: "Python",
    author: {
      name: "Alex Rivera",
      username: "arivera",
      avatar: "/male-developer-avatar.png",
    },
    timestamp: "5h ago",
    code: <PythonAsyncSample />,
    likes: 156,
    comments: 12,
    forks: 28,
    tags: ["python", "async", "aiohttp", "concurrency"],
    description:
      "Async HTTP fetcher using aiohttp for concurrent requests. Great for web scraping and API integrations that need high throughput.",
  },
  "3": {
    filename: "api-client.ts",
    language: "TypeScript",
    author: {
      name: "Jordan Kim",
      username: "jkim_dev",
      avatar: "/developer-portrait.png",
    },
    timestamp: "8h ago",
    code: <TypeScriptAPISample />,
    likes: 89,
    comments: 7,
    forks: 15,
    tags: ["typescript", "api", "generics", "fetch"],
    description:
      "A type-safe API client with generics support. Handles common HTTP methods with proper error handling and response typing.",
  },
}

const commentsData = [
  {
    id: 1,
    author: { name: "Mike Johnson", username: "mikej", avatar: "/developer-avatar.png" },
    content: "This is exactly what I needed! Clean implementation.",
    timestamp: "1h ago",
    likes: 12,
  },
  {
    id: 2,
    author: { name: "Emily Wong", username: "emilyw", avatar: "/female-developer.png" },
    content: "Have you considered adding a cancel option for the debounce?",
    timestamp: "45m ago",
    likes: 8,
  },
  {
    id: 3,
    author: { name: "David Park", username: "dpark", avatar: "/male-developer.png" },
    content: "Great work! I forked this and added some extra features.",
    timestamp: "30m ago",
    likes: 5,
  },
]

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = posts[id]

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 md:ml-16 lg:ml-56">
            <div className="mx-auto max-w-3xl px-4 py-6">
              <p className="text-muted-foreground">Post not found</p>
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
          <div className="mx-auto max-w-3xl px-4 py-6">
            {/* Back Button */}
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to feed
            </Link>

            {/* Post */}
            <article className="rounded-lg border border-border bg-card overflow-hidden">
              {/* Author Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{post.author.name}</span>
                    <span className="text-sm text-muted-foreground">
                      @{post.author.username} · {post.timestamp}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Follow
                </Button>
              </div>

              {/* Description */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm text-muted-foreground">{post.description}</p>
              </div>

              {/* Code Header */}
              <div className="flex items-center justify-between bg-secondary/50 px-4 py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <span className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="ml-2 font-mono text-sm text-muted-foreground">{post.filename}</span>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {post.language}
                </Badge>
              </div>

              {/* Code */}
              <div className="overflow-x-auto code-scrollbar">
                <pre className="p-4 font-mono text-sm leading-relaxed">{post.code}</pre>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 px-4 py-3 border-t border-border">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs font-normal">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-red-400">
                    <Heart className="h-4 w-4" />
                    <span className="text-xs">{post.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-primary">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-xs">{post.comments}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-green-400">
                    <GitFork className="h-4 w-4" />
                    <span className="text-xs">{post.forks}</span>
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </article>

            {/* Comments Section */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Comments ({commentsData.length})</h2>

              {/* Comment Input */}
              <div className="flex gap-3 mb-6">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/developer-avatar.png" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea placeholder="Write a comment..." className="min-h-20 resize-none" />
                  <div className="flex justify-end">
                    <Button size="sm">Post Comment</Button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {commentsData.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-4 rounded-lg border border-border bg-card">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{comment.author.name}</span>
                        <span className="text-xs text-muted-foreground">@{comment.author.username}</span>
                        <span className="text-xs text-muted-foreground">· {comment.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{comment.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground hover:text-red-400 h-7 px-2"
                      >
                        <Heart className="h-3 w-3" />
                        <span className="text-xs">{comment.likes}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
