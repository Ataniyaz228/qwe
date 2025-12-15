"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { BookmarkCard } from "@/components/bookmark-card"
import { BookmarksEmpty } from "@/components/bookmarks-empty"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, Grid3X3, List, Bookmark } from "lucide-react"

const initialBookmarks = [
  {
    id: "1",
    title: "react-query-hooks",
    description:
      "A collection of custom React Query hooks for common data fetching patterns. Includes pagination, infinite scroll, and optimistic updates.",
    language: "TypeScript",
    languageColor: "bg-blue-500",
    author: { name: "Sarah Chen", avatar: "/female-developer.png" },
    stars: 1234,
    forks: 156,
    views: 5420,
    tags: ["react", "hooks", "query", "typescript"],
    savedAt: "2 days ago",
  },
  {
    id: "2",
    title: "go-microservice",
    description: "Production-ready Go microservice template with gRPC, REST, and message queue support.",
    language: "Go",
    languageColor: "bg-cyan-500",
    author: { name: "Jordan Kim", avatar: "/developer-avatar.png" },
    stars: 2341,
    forks: 432,
    views: 12500,
    tags: ["go", "microservice", "grpc"],
    savedAt: "5 days ago",
  },
  {
    id: "3",
    title: "py-async-utils",
    description: "Async utility functions for Python including rate limiters, retry decorators, and connection pools.",
    language: "Python",
    languageColor: "bg-yellow-500",
    author: { name: "Alex Rivera", avatar: "/developer-avatar.png" },
    stars: 892,
    forks: 98,
    views: 3210,
    tags: ["python", "async", "utilities"],
    savedAt: "1 week ago",
  },
  {
    id: "4",
    title: "rust-cli-toolkit",
    description: "Build beautiful CLI apps in Rust with progress bars, spinners, and colorful output.",
    language: "Rust",
    languageColor: "bg-orange-500",
    author: { name: "Maria Lopez", avatar: "/female-developer.png" },
    stars: 567,
    forks: 45,
    views: 2100,
    tags: ["rust", "cli", "terminal"],
    savedAt: "2 weeks ago",
  },
  {
    id: "5",
    title: "node-auth-kit",
    description: "Complete authentication solution for Node.js with JWT, OAuth2, and session support.",
    language: "JavaScript",
    languageColor: "bg-yellow-400",
    author: { name: "Mike Johnson", avatar: "/developer-avatar.png" },
    stars: 1890,
    forks: 234,
    views: 8900,
    tags: ["node", "auth", "jwt", "oauth"],
    savedAt: "3 weeks ago",
  },
]

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState(initialBookmarks)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [filterLanguage, setFilterLanguage] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const handleRemoveBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }

  const filteredBookmarks = bookmarks
    .filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesLanguage = filterLanguage === "all" || b.language.toLowerCase() === filterLanguage.toLowerCase()
      return matchesSearch && matchesLanguage
    })
    .sort((a, b) => {
      if (sortBy === "stars") return b.stars - a.stars
      if (sortBy === "title") return a.title.localeCompare(b.title)
      return 0 // recent - keep original order
    })

  const languages = [...new Set(bookmarks.map((b) => b.language))]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56">
          <div className="mx-auto max-w-5xl px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  <Bookmark className="h-6 w-6 text-primary" />
                  Bookmarks
                </h1>
                <p className="text-muted-foreground">
                  {bookmarks.length} saved snippet{bookmarks.length !== 1 && "s"}
                </p>
              </div>
            </div>

            {bookmarks.length === 0 ? (
              <BookmarksEmpty />
            ) : (
              <>
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search bookmarks..."
                      className="pl-9 bg-card border-border"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                    <SelectTrigger className="w-[140px] bg-card border-border">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang.toLowerCase()}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px] bg-card border-border">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Date Added</SelectItem>
                      <SelectItem value="stars">Most Stars</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1 ml-auto">
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Results */}
                {filteredBookmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No bookmarks match your search.</p>
                  </div>
                ) : (
                  <div
                    className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-3"}
                  >
                    {filteredBookmarks.map((bookmark) => (
                      <BookmarkCard
                        key={bookmark.id}
                        {...bookmark}
                        onRemove={() => handleRemoveBookmark(bookmark.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
