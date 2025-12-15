"use client"

import Link from "next/link"
import { Bookmark, Heart, GitFork, Eye, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BookmarkCardProps {
  id: string // added id prop for navigation
  title: string
  description: string
  language: string
  languageColor: string
  author: {
    name: string
    avatar: string
  }
  stars: number
  forks: number
  views: number
  tags: string[]
  savedAt: string
  onRemove?: () => void
}

export function BookmarkCard({
  id,
  title,
  description,
  language,
  languageColor,
  author,
  stars,
  forks,
  views,
  tags,
  savedAt,
  onRemove,
}: BookmarkCardProps) {
  return (
    <Link href={`/post/${id}`} className="block">
      <article className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn("h-3 w-3 rounded-full shrink-0", languageColor)} />
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{title}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="font-mono text-xs">
              {language}
            </Badge>
            <Bookmark className="h-4 w-4 text-primary fill-primary" />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal px-2 py-0">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-border">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage src={author.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">{author.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">{author.name}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground ml-auto">
            <span className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" />
              {stars}
            </span>
            <span className="flex items-center gap-1.5">
              <GitFork className="h-3.5 w-3.5" />
              {forks}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              {views}
            </span>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Saved {savedAt}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onRemove?.()
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>
      </article>
    </Link>
  )
}
