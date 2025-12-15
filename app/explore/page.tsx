"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { ExploreFilters } from "@/components/explore-filters"
import { ExploreCard } from "@/components/explore-card"
import { TrendingUp, Flame, Clock } from "lucide-react"

const exploreItems = [
  {
    id: "react-query-hooks",
    title: "react-query-hooks",
    description:
      "A collection of custom React Query hooks for common data fetching patterns. Includes pagination, infinite scroll, and optimistic updates out of the box.",
    language: "TypeScript",
    languageColor: "bg-blue-500",
    author: { name: "Sarah Chen", avatar: "/female-developer-avatar.png" },
    stars: 1234,
    forks: 156,
    views: 5420,
    tags: ["react", "hooks", "query", "data-fetching", "typescript"],
    featured: true,
  },
  {
    id: "py-async-utils",
    title: "py-async-utils",
    description: "Async utility functions for Python including rate limiters, retry decorators, and connection pools.",
    language: "Python",
    languageColor: "bg-yellow-500",
    author: { name: "Alex Rivera", avatar: "/male-developer-avatar.png" },
    stars: 892,
    forks: 98,
    views: 3210,
    tags: ["python", "async", "utilities"],
  },
  {
    id: "go-microservice",
    title: "go-microservice",
    description: "Production-ready Go microservice template with gRPC, REST, and message queue support.",
    language: "Go",
    languageColor: "bg-cyan-500",
    author: { name: "Jordan Kim", avatar: "/developer-portrait.png" },
    stars: 2341,
    forks: 432,
    views: 12500,
    tags: ["go", "microservice", "grpc"],
  },
  {
    id: "rust-cli-toolkit",
    title: "rust-cli-toolkit",
    description: "Build beautiful CLI apps in Rust with progress bars, spinners, and colorful output.",
    language: "Rust",
    languageColor: "bg-orange-500",
    author: { name: "Maria Lopez", avatar: "/female-developer-avatar.png" },
    stars: 567,
    forks: 45,
    views: 2100,
    tags: ["rust", "cli", "terminal"],
  },
  {
    id: "vue-composables",
    title: "vue-composables",
    description: "Essential Vue 3 composables for state management, form validation, and API integration.",
    language: "TypeScript",
    languageColor: "bg-blue-500",
    author: { name: "Chen Wei", avatar: "/developer-avatar.png" },
    stars: 445,
    forks: 67,
    views: 1890,
    tags: ["vue", "composables", "typescript"],
    featured: true,
  },
  {
    id: "node-auth-kit",
    title: "node-auth-kit",
    description: "Complete authentication solution for Node.js with JWT, OAuth2, and session support.",
    language: "JavaScript",
    languageColor: "bg-yellow-400",
    author: { name: "Mike Johnson", avatar: "/male-developer-avatar.png" },
    stars: 1890,
    forks: 234,
    views: 8900,
    tags: ["node", "auth", "jwt"],
  },
  {
    id: "swift-networking",
    title: "swift-networking",
    description: "Modern networking layer for iOS using async/await and Combine publishers.",
    language: "Swift",
    languageColor: "bg-orange-600",
    author: { name: "Emma Wilson", avatar: "/female-developer-avatar.png" },
    stars: 678,
    forks: 89,
    views: 3400,
    tags: ["swift", "ios", "networking"],
  },
  {
    id: "docker-compose-kit",
    title: "docker-compose-kit",
    description: "Ready-to-use Docker Compose configurations for popular development stacks.",
    language: "YAML",
    languageColor: "bg-red-500",
    author: { name: "DevOps Pro", avatar: "/developer-avatar.png" },
    stars: 3456,
    forks: 890,
    views: 15600,
    tags: ["docker", "devops", "compose"],
  },
]

export default function ExplorePage() {
  const searchParams = useSearchParams()

  const tagFromUrl = searchParams.get("tag")

  const [searchQuery, setSearchQuery] = useState("")
  const [activeLanguage, setActiveLanguage] = useState("All")
  const [activeTags, setActiveTags] = useState<string[]>(tagFromUrl ? [tagFromUrl] : [])
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const [activeTime, setActiveTime] = useState("This Week")
  const [activeSort, setActiveSort] = useState("Most Stars")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (tagFromUrl && !activeTags.includes(tagFromUrl)) {
      setActiveTags([tagFromUrl])
    }
  }, [tagFromUrl])

  const filteredItems = useMemo(() => {
    let items = [...exploreItems]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          item.author.name.toLowerCase().includes(query),
      )
    }

    // Filter by language
    if (activeLanguage !== "All") {
      items = items.filter((item) => item.language === activeLanguage)
    }

    // Filter by tags
    if (activeTags.length > 0) {
      items = items.filter((item) => activeTags.some((tag) => item.tags.includes(tag.toLowerCase())))
    }

    // Sort items
    switch (activeSort) {
      case "Most Stars":
        items.sort((a, b) => b.stars - a.stars)
        break
      case "Most Forks":
        items.sort((a, b) => b.forks - a.forks)
        break
      case "Recent":
        // Keep original order (simulating recent)
        break
      default:
        break
    }

    return items
  }, [searchQuery, activeLanguage, activeTags, activeSort])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56">
          <div className="mx-auto max-w-6xl px-4 py-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">Explore</h1>
              <p className="text-muted-foreground">Discover trending code snippets and repositories</p>
            </div>

            <div className="mb-6">
              <ExploreFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeLanguage={activeLanguage}
                onLanguageChange={setActiveLanguage}
                activeTags={activeTags}
                onTagsChange={setActiveTags}
                activeCategories={activeCategories}
                onCategoriesChange={setActiveCategories}
                activeTime={activeTime}
                onTimeChange={setActiveTime}
                activeSort={activeSort}
                onSortChange={setActiveSort}
                showFilters={showFilters}
                onShowFiltersChange={setShowFilters}
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2.4k</p>
                  <p className="text-xs text-muted-foreground">Trending Today</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12.8k</p>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-xs text-muted-foreground">New Today</p>
                </div>
              </div>
            </div>

            {(searchQuery || activeLanguage !== "All" || activeTags.length > 0) && (
              <p className="text-sm text-muted-foreground mb-4">
                Showing {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""}
              </p>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => <ExploreCard key={item.id} {...item} />)
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No results found. Try adjusting your filters.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
