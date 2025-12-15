"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Flame,
  Clock,
  Calendar,
  CalendarDays,
  Filter,
  ArrowUpDown,
  TrendingUp,
  Star,
  MessageSquare,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { TrendingCard } from "@/components/trending-card"
import { cn } from "@/lib/utils"

const timeFilters = [
  { id: "today", label: "Today", icon: Clock },
  { id: "week", label: "This Week", icon: Calendar },
  { id: "month", label: "This Month", icon: CalendarDays },
]

const sortOptions = [
  { id: "growth", label: "Growth Rate", icon: TrendingUp },
  { id: "stars", label: "Most Stars", icon: Star },
  { id: "comments", label: "Most Comments", icon: MessageSquare },
]

const languages = ["All", "JavaScript", "Python", "TypeScript", "React", "Go", "Rust", "CSS"]

const trendingPosts = [
  {
    id: "trending-1",
    rank: 1,
    title: "useOptimistic Hook Pattern",
    description:
      "A comprehensive guide to using React 19's useOptimistic hook for instant UI updates with automatic rollback on errors.",
    language: "TypeScript",
    languageColor: "bg-blue-500",
    author: { name: "sarah_dev", avatar: "/female-developer.png", verified: true },
    stars: 892,
    forks: 234,
    comments: 156,
    views: 12400,
    growthPercent: 340,
    isHot: true,
    postedAt: "6 hours ago",
    timeCategory: "today",
    tags: ["react", "hooks", "typescript"],
  },
  {
    id: "trending-2",
    rank: 2,
    title: "Rust Error Handling Patterns",
    description: "Modern error handling in Rust using thiserror and anyhow crates with real-world examples.",
    language: "Rust",
    languageColor: "bg-orange-500",
    author: { name: "rustacean", avatar: "/developer-avatar.png", verified: true },
    stars: 654,
    forks: 89,
    comments: 78,
    views: 8200,
    growthPercent: 210,
    isHot: true,
    postedAt: "12 hours ago",
    timeCategory: "today",
    tags: ["rust", "error-handling", "best-practices"],
  },
  {
    id: "trending-3",
    rank: 3,
    title: "Python Async Context Managers",
    description: "Deep dive into async context managers with practical database connection pool examples.",
    language: "Python",
    languageColor: "bg-yellow-500",
    author: { name: "py_wizard", avatar: "/developer-avatar.png", verified: false },
    stars: 543,
    forks: 67,
    comments: 45,
    views: 6100,
    growthPercent: 180,
    isHot: false,
    postedAt: "18 hours ago",
    timeCategory: "today",
    tags: ["python", "async", "context-managers"],
  },
  {
    id: "trending-4",
    rank: 4,
    title: "Next.js 15 Server Actions",
    description: "Complete guide to server actions in Next.js 15 with form handling, validation, and error states.",
    language: "TypeScript",
    languageColor: "bg-blue-500",
    author: { name: "nextjs_fan", avatar: "/female-developer.png", verified: true },
    stars: 478,
    forks: 123,
    comments: 89,
    views: 5400,
    growthPercent: 156,
    isHot: false,
    postedAt: "2 days ago",
    timeCategory: "week",
    tags: ["nextjs", "server-actions", "forms"],
  },
  {
    id: "trending-5",
    rank: 5,
    title: "Go Concurrency Patterns",
    description: "Worker pools, fan-out/fan-in, and pipeline patterns in Go with practical examples.",
    language: "Go",
    languageColor: "bg-cyan-500",
    author: { name: "gopher", avatar: "/developer-avatar.png", verified: false },
    stars: 412,
    forks: 56,
    comments: 34,
    views: 4800,
    growthPercent: 134,
    isHot: false,
    postedAt: "3 days ago",
    timeCategory: "week",
    tags: ["go", "concurrency", "goroutines"],
  },
  {
    id: "trending-6",
    rank: 6,
    title: "CSS Container Queries",
    description: "Building truly responsive components with CSS container queries and modern layout techniques.",
    language: "CSS",
    languageColor: "bg-purple-500",
    author: { name: "css_master", avatar: "/female-developer.png", verified: false },
    stars: 389,
    forks: 45,
    comments: 28,
    views: 4200,
    growthPercent: 112,
    isHot: false,
    postedAt: "5 days ago",
    timeCategory: "week",
    tags: ["css", "responsive", "container-queries"],
  },
  {
    id: "trending-7",
    rank: 7,
    title: "JavaScript Proxy Deep Dive",
    description: "Understanding JavaScript Proxy for reactive state management and object interception.",
    language: "JavaScript",
    languageColor: "bg-yellow-400",
    author: { name: "js_ninja", avatar: "/male-developer.png", verified: true },
    stars: 356,
    forks: 42,
    comments: 67,
    views: 3900,
    growthPercent: 98,
    isHot: false,
    postedAt: "1 week ago",
    timeCategory: "week",
    tags: ["javascript", "proxy", "state-management"],
  },
  {
    id: "trending-8",
    rank: 8,
    title: "React Server Components Guide",
    description: "Complete migration guide from client components to RSC with performance benchmarks.",
    language: "React",
    languageColor: "bg-cyan-400",
    author: { name: "react_pro", avatar: "/female-developer-avatar.png", verified: true },
    stars: 298,
    forks: 78,
    comments: 112,
    views: 5600,
    growthPercent: 85,
    isHot: false,
    postedAt: "2 weeks ago",
    timeCategory: "month",
    tags: ["react", "rsc", "performance"],
  },
  {
    id: "trending-9",
    rank: 9,
    title: "Python Type Hints Advanced",
    description: "Advanced type hints with generics, protocols, and TypeVar for better code quality.",
    language: "Python",
    languageColor: "bg-yellow-500",
    author: { name: "type_master", avatar: "/developer-portrait.png", verified: false },
    stars: 267,
    forks: 34,
    comments: 23,
    views: 2800,
    growthPercent: 72,
    isHot: false,
    postedAt: "3 weeks ago",
    timeCategory: "month",
    tags: ["python", "typing", "generics"],
  },
  {
    id: "trending-10",
    rank: 10,
    title: "Tailwind CSS Animation Tricks",
    description: "Creating smooth micro-interactions and animations with Tailwind CSS utilities.",
    language: "CSS",
    languageColor: "bg-purple-500",
    author: { name: "tailwind_fan", avatar: "/male-developer-avatar.png", verified: false },
    stars: 234,
    forks: 56,
    comments: 41,
    views: 3200,
    growthPercent: 65,
    isHot: false,
    postedAt: "3 weeks ago",
    timeCategory: "month",
    tags: ["tailwind", "css", "animations"],
  },
]

export default function TrendingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTime, setActiveTime] = useState("today")
  const [activeLanguage, setActiveLanguage] = useState("All")
  const [sortBy, setSortBy] = useState("growth") // added sort state

  const filteredAndSortedPosts = useMemo(() => {
    let posts = trendingPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesLanguage = activeLanguage === "All" || post.language === activeLanguage

      let matchesTime = true
      if (activeTime === "today") {
        matchesTime = post.timeCategory === "today"
      } else if (activeTime === "week") {
        matchesTime = post.timeCategory === "today" || post.timeCategory === "week"
      } else if (activeTime === "month") {
        matchesTime = true // show all for month
      }

      return matchesSearch && matchesLanguage && matchesTime
    })

    posts = [...posts].sort((a, b) => {
      switch (sortBy) {
        case "stars":
          return b.stars - a.stars
        case "comments":
          return b.comments - a.comments
        case "growth":
        default:
          return b.growthPercent - a.growthPercent
      }
    })

    return posts.map((post, index) => ({
      ...post,
      rank: index + 1,
    }))
  }, [searchQuery, activeLanguage, activeTime, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />

      <main className="pt-14 md:pl-16 lg:pl-56">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="h-8 w-8 text-orange-500" />
              <h1 className="text-3xl font-bold">Trending</h1>
            </div>
            <p className="text-muted-foreground">
              Discover the hottest code snippets based on engagement velocity and community activity.
            </p>
          </div>

          {/* How Trending Works */}
          <div className="mb-6 p-4 rounded-lg border border-border bg-card/50">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              How Trending Works
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Posts are ranked by <span className="text-foreground font-medium">engagement velocity</span> — how quickly
              they gain likes, comments, and forks. The formula:{" "}
              <code className="bg-muted px-1 rounded text-[10px]">
                score = (likes + comments×2 + forks×3) / hours^1.5
              </code>
              . Verified authors get a small boost. Posts marked{" "}
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-orange-500 border-orange-500/50">
                HOT
              </Badge>{" "}
              have exceptional growth rates.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trending snippets..."
                className="pl-9 bg-card border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Time Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {timeFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeTime === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTime(filter.id)}
                  className={cn("gap-1.5", activeTime === filter.id && "bg-primary text-primary-foreground")}
                >
                  <filter.icon className="h-3.5 w-3.5" />
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Sort Options - added sort buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-1">Sort by:</span>
              {sortOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={sortBy === option.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy(option.id)}
                  className={cn("gap-1.5", sortBy === option.id && "bg-secondary")}
                >
                  <option.icon className="h-3.5 w-3.5" />
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Language Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {languages.map((lang) => (
                <Badge
                  key={lang}
                  variant={activeLanguage === lang ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors",
                    activeLanguage === lang ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                  onClick={() => setActiveLanguage(lang)}
                >
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{filteredAndSortedPosts.length} trending snippets</span>
          </div>

          {/* Trending Grid */}
          <div className="space-y-4">
            {filteredAndSortedPosts.map((post) => (
              <TrendingCard key={post.id} {...post} />
            ))}
          </div>

          {filteredAndSortedPosts.length === 0 && (
            <div className="text-center py-12">
              <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No trending posts found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
