"use client"

import { useState } from "react"
import { Search, Grid3X3, LayoutList, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { TagCard } from "@/components/tag-card"
import { cn } from "@/lib/utils"

const tags = [
  {
    name: "JavaScript",
    icon: "JS",
    color: "bg-yellow-500/20 text-yellow-400",
    snippets: 12453,
    trending: true,
    description: "High-level, interpreted programming language. Core technology of the web alongside HTML and CSS.",
  },
  {
    name: "TypeScript",
    icon: "TS",
    color: "bg-blue-500/20 text-blue-400",
    snippets: 8921,
    trending: true,
    description: "Strongly typed programming language that builds on JavaScript. Adds optional static typing.",
  },
  {
    name: "Python",
    icon: "PY",
    color: "bg-green-500/20 text-green-400",
    snippets: 10234,
    trending: false,
    description: "Versatile, high-level language known for readability. Popular for AI, data science, and scripting.",
  },
  {
    name: "React",
    icon: "⚛",
    color: "bg-cyan-500/20 text-cyan-400",
    snippets: 7845,
    trending: true,
    description: "JavaScript library for building user interfaces. Component-based architecture with virtual DOM.",
  },
  {
    name: "Rust",
    icon: "RS",
    color: "bg-orange-500/20 text-orange-400",
    snippets: 3421,
    trending: true,
    description:
      "Systems programming language focused on safety and performance. Memory-safe without garbage collection.",
  },
  {
    name: "Go",
    icon: "GO",
    color: "bg-sky-500/20 text-sky-400",
    snippets: 4562,
    trending: false,
    description: "Statically typed, compiled language designed at Google. Known for simplicity and concurrency.",
  },
  {
    name: "Vue",
    icon: "V",
    color: "bg-emerald-500/20 text-emerald-400",
    snippets: 3124,
    trending: false,
    description: "Progressive JavaScript framework for building UIs. Incrementally adoptable architecture.",
  },
  {
    name: "Node.js",
    icon: "N",
    color: "bg-lime-500/20 text-lime-400",
    snippets: 6234,
    trending: false,
    description: "JavaScript runtime built on Chrome's V8 engine. Enables server-side JavaScript execution.",
  },
  {
    name: "CSS",
    icon: "{ }",
    color: "bg-purple-500/20 text-purple-400",
    snippets: 5678,
    trending: false,
    description: "Style sheet language for describing presentation of documents. Core web technology for styling.",
  },
  {
    name: "SQL",
    icon: "DB",
    color: "bg-pink-500/20 text-pink-400",
    snippets: 4123,
    trending: false,
    description: "Domain-specific language for managing relational databases. Standard for data querying.",
  },
  {
    name: "Docker",
    icon: "🐳",
    color: "bg-blue-600/20 text-blue-300",
    snippets: 2341,
    trending: true,
    description: "Platform for developing and running applications in containers. Simplifies deployment.",
  },
  {
    name: "GraphQL",
    icon: "◈",
    color: "bg-fuchsia-500/20 text-fuchsia-400",
    snippets: 1892,
    trending: false,
    description: "Query language for APIs. Provides a complete description of data and allows precise requests.",
  },
]

const sortOptions = ["Popular", "Alphabetical", "Recent", "Trending"]

export default function TagsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSort, setActiveSort] = useState("Popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredTags = tags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const sortedTags = [...filteredTags].sort((a, b) => {
    switch (activeSort) {
      case "Alphabetical":
        return a.name.localeCompare(b.name)
      case "Trending":
        return (b.trending ? 1 : 0) - (a.trending ? 1 : 0)
      case "Recent":
        return 0 // Would sort by date in real app
      default: // Popular
        return b.snippets - a.snippets
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 ml-16 lg:ml-64 pt-20 pb-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Browse Tags</h1>
              <p className="text-muted-foreground">
                Explore code snippets by programming language, framework, or technology
              </p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border focus:bg-secondary"
                />
              </div>

              {/* Sort & View */}
              <div className="flex gap-2">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={activeSort}
                    onChange={(e) => setActiveSort(e.target.value)}
                    className="bg-transparent text-sm outline-none cursor-pointer"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-card">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={cn("rounded-none h-10 w-10", viewMode === "grid" && "bg-secondary")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={cn("rounded-none h-10 w-10", viewMode === "list" && "bg-secondary")}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tags Grid/List */}
            <div
              className={cn(
                viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3",
              )}
            >
              {sortedTags.map((tag) => (
                <TagCard key={tag.name} {...tag} />
              ))}
            </div>

            {/* Empty State */}
            {sortedTags.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No tags found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
