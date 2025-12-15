import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { PostCard } from "@/components/post-card"
import { Widgets } from "@/components/widgets"
import { ReactHookSample, PythonAsyncSample, TypeScriptAPISample } from "@/components/code-samples"

const posts = [
  {
    id: "1",
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
  },
  {
    id: "2",
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
  },
  {
    id: "3",
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
  },
]

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="flex gap-6">
              {/* Feed */}
              <div className="flex-1 max-w-2xl flex flex-col gap-4">
                {posts.map((post, index) => (
                  <PostCard key={index} {...post} />
                ))}
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
