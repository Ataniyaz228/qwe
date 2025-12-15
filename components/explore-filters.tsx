"use client"

import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const languages = [
  { name: "All", icon: "✦" },
  { name: "JavaScript", icon: "JS" },
  { name: "TypeScript", icon: "TS" },
  { name: "Python", icon: "PY" },
  { name: "Rust", icon: "RS" },
  { name: "Go", icon: "GO" },
  { name: "Swift", icon: "SW" },
  { name: "YAML", icon: "YML" },
]

const categories = ["Frontend", "Backend", "DevOps", "AI/ML", "Database", "Mobile"]
const timeFilters = ["Today", "This Week", "This Month", "All Time"]
const sortOptions = ["Most Stars", "Recent", "Most Forks", "Most Comments"]

const popularTags = [
  "react",
  "hooks",
  "typescript",
  "python",
  "async",
  "go",
  "microservice",
  "rust",
  "cli",
  "vue",
  "node",
  "auth",
  "docker",
  "devops",
  "ios",
  "swift",
]

interface ExploreFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  activeLanguage: string
  onLanguageChange: (language: string) => void
  activeTags: string[]
  onTagsChange: (tags: string[]) => void
  activeCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  activeTime: string
  onTimeChange: (time: string) => void
  activeSort: string
  onSortChange: (sort: string) => void
  showFilters: boolean
  onShowFiltersChange: (show: boolean) => void
}

export function ExploreFilters({
  searchQuery,
  onSearchChange,
  activeLanguage,
  onLanguageChange,
  activeTags,
  onTagsChange,
  activeCategories,
  onCategoriesChange,
  activeTime,
  onTimeChange,
  activeSort,
  onSortChange,
  showFilters,
  onShowFiltersChange,
}: ExploreFiltersProps) {
  const toggleCategory = (cat: string) => {
    onCategoriesChange(
      activeCategories.includes(cat) ? activeCategories.filter((c) => c !== cat) : [...activeCategories, cat],
    )
  }

  const toggleTag = (tag: string) => {
    onTagsChange(activeTags.includes(tag) ? activeTags.filter((t) => t !== tag) : [...activeTags, tag])
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search snippets, repos, tags..."
            className="pl-10 bg-secondary/50 border-border focus:bg-secondary"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onShowFiltersChange(!showFilters)}
          className={cn(showFilters && "bg-primary text-primary-foreground")}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Language Pills */}
      <div className="flex flex-wrap gap-2">
        {languages.map((lang) => (
          <button
            key={lang.name}
            onClick={() => onLanguageChange(lang.name)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              activeLanguage === lang.name
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <span className="font-mono text-xs opacity-70">{lang.icon}</span>
            {lang.name}
          </button>
        ))}
      </div>

      {activeTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active tags:</span>
          {activeTags.map((tag) => (
            <Badge key={tag} variant="default" className="cursor-pointer" onClick={() => toggleTag(tag)}>
              {tag}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
          <button onClick={() => onTagsChange([])} className="text-xs text-muted-foreground hover:text-foreground">
            Clear all
          </button>
        </div>
      )}

      {/* Extended Filters Panel */}
      {showFilters && (
        <div className="p-4 rounded-lg border border-border bg-card space-y-4 animate-in slide-in-from-top-2">
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={activeTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  {activeTags.includes(tag) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={activeCategories.includes(cat) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                  {activeCategories.includes(cat) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Time Period</h4>
            <div className="flex flex-wrap gap-2">
              {timeFilters.map((time) => (
                <button
                  key={time}
                  onClick={() => onTimeChange(time)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs transition-colors",
                    activeTime === time
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Sort By</h4>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((sort) => (
                <button
                  key={sort}
                  onClick={() => onSortChange(sort)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs transition-colors",
                    activeSort === sort
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {sort}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
