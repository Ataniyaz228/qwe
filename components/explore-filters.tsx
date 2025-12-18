"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, X, Hash, Clock, ArrowUpDown, Layers } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"

const languages = [
  { name: "All", icon: "✦" },
  { name: "JavaScript", icon: "JS" },
  { name: "TypeScript", icon: "TS" },
  { name: "Python", icon: "PY" },
  { name: "Rust", icon: "RS" },
  { name: "Go", icon: "GO" },
  { name: "C++", icon: "C+" },
  { name: "Java", icon: "JV" },
]

const categories = ["Frontend", "Backend", "DevOps", "AI/ML", "Database", "Mobile"]
const timeFilters = ["Сегодня", "Неделя", "Месяц", "Всё время"]
const sortOptions = [
  { value: "Most Likes", label: "По лайкам" },
  { value: "Most Comments", label: "По комментариям" },
  { value: "Most Views", label: "По просмотрам" },
  { value: "Recent", label: "Новые" },
]

const popularTags = [
  "react", "hooks", "typescript", "python", "async", "go",
  "microservice", "rust", "cli", "vue", "node", "auth",
  "docker", "devops", "ios", "swift",
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
  const [isFocused, setIsFocused] = useState(false)
  const { t } = useLanguage()

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
        <div className={cn(
          "relative flex-1 rounded-xl transition-all duration-200",
          isFocused && "ring-1 ring-white/[0.12]"
        )}>
          <Search className={cn(
            "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
            isFocused ? "text-white/50" : "text-white/25"
          )} strokeWidth={1.5} />
          <Input
            placeholder={t.filters.searchPlaceholder}
            className="h-10 pl-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.1] focus-visible:ring-0 rounded-xl"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onShowFiltersChange(!showFilters)}
          className={cn(
            "h-10 w-10 rounded-xl border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-all",
            showFilters && "bg-white/[0.08] border-white/[0.12]"
          )}
        >
          <SlidersHorizontal className={cn(
            "h-4 w-4 transition-colors",
            showFilters ? "text-white/70" : "text-white/40"
          )} strokeWidth={1.5} />
        </Button>
      </div>

      {/* Language Pills */}
      <div className="flex flex-wrap gap-2">
        {languages.map((lang) => (
          <button
            key={lang.name}
            onClick={() => onLanguageChange(lang.name)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              activeLanguage === lang.name
                ? "bg-white/[0.1] text-white/90 border border-white/[0.12]"
                : "bg-white/[0.02] text-white/40 border border-white/[0.04] hover:bg-white/[0.05] hover:text-white/60"
            )}
          >
            <span className="font-mono text-[10px] opacity-60">{lang.icon}</span>
            {lang.name}
          </button>
        ))}
      </div>

      {/* Active Tags */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">{t.filters.activeTags}</span>
          {activeTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.08] text-white/70 text-xs hover:bg-white/[0.12] transition-colors"
            >
              {tag}
              <X className="h-3 w-3 text-white/40" strokeWidth={2} />
            </button>
          ))}
          <button
            onClick={() => onTagsChange([])}
            className="text-[10px] text-white/30 hover:text-white/60 transition-colors ml-1"
          >
            {t.filters.clear}
          </button>
        </div>
      )}

      {/* Extended Filters Panel */}
      {showFilters && (
        <div className="p-4 rounded-2xl border border-white/[0.04] bg-white/[0.02] space-y-5 animate-in slide-in-from-top-2">
          {/* Tags */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Hash className="h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
              <h4 className="text-xs font-medium text-white/50">{t.filters.tags}</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs transition-all duration-200",
                    activeTags.includes(tag)
                      ? "bg-white/[0.1] text-white/80 border border-white/[0.12]"
                      : "bg-white/[0.02] text-white/35 border border-white/[0.04] hover:bg-white/[0.05] hover:text-white/60"
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
              <h4 className="text-xs font-medium text-white/50">{t.filters.categories}</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs transition-all duration-200",
                    activeCategories.includes(cat)
                      ? "bg-white/[0.1] text-white/80 border border-white/[0.12]"
                      : "bg-white/[0.02] text-white/35 border border-white/[0.04] hover:bg-white/[0.05] hover:text-white/60"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Time Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
                <h4 className="text-xs font-medium text-white/50">{t.filters.period}</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {timeFilters.map((time) => (
                  <button
                    key={time}
                    onClick={() => onTimeChange(time)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs transition-all duration-200",
                      activeTime === time
                        ? "bg-white/[0.08] text-white/70"
                        : "text-white/30 hover:text-white/60"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpDown className="h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
                <h4 className="text-xs font-medium text-white/50">{t.filters.sort}</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sortOptions.map((sort) => (
                  <button
                    key={sort.value}
                    onClick={() => onSortChange(sort.value)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs transition-all duration-200",
                      activeSort === sort.value
                        ? "bg-white/[0.08] text-white/70"
                        : "text-white/30 hover:text-white/60"
                    )}
                  >
                    {sort.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
