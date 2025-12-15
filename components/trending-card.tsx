"use client"

import Link from "next/link"
import { Flame, Heart, GitFork, Eye, MessageSquare, TrendingUp, ArrowUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TrendingCardProps {
  id: string // added id prop
  rank: number
  title: string
  description: string
  language: string
  languageColor: string
  author: {
    name: string
    avatar: string
    verified?: boolean
  }
  stars: number
  forks: number
  comments: number
  views: number
  growthPercent: number
  isHot?: boolean
  postedAt: string
  tags: string[]
}

export function TrendingCard({
  id, // added id prop
  rank,
  title,
  description,
  language,
  languageColor,
  author,
  stars,
  forks,
  comments,
  views,
  growthPercent,
  isHot,
  postedAt,
  tags,
}: TrendingCardProps) {
  return (
    <Link href={`/post/${id}`}>
      <article className="group relative rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
        {/* Rank Badge */}
        <div
          className={cn(
            "absolute -left-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm border-2",
            rank === 1 && "bg-yellow-500/20 border-yellow-500 text-yellow-500",
            rank === 2 && "bg-slate-400/20 border-slate-400 text-slate-400",
            rank === 3 && "bg-amber-600/20 border-amber-600 text-amber-600",
            rank > 3 && "bg-muted border-border text-muted-foreground",
          )}
        >
          #{rank}
        </div>

        {/* Hot indicator */}
        {isHot && (
          <div className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full bg-orange-500/20 border border-orange-500/50 px-2 py-0.5">
            <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
            <span className="text-xs font-medium text-orange-500">HOT</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3 mt-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn("h-3 w-3 rounded-full shrink-0", languageColor)} />
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{title}</h3>
          </div>
          <Badge variant="secondary" className="font-mono text-xs shrink-0">
            {language}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal px-2 py-0">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Growth Indicator */}
        <div className="flex items-center gap-2 mb-4 p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-500">
            <ArrowUp className="h-3 w-3 inline" /> {growthPercent}% growth
          </span>
          <span className="text-xs text-muted-foreground ml-auto">in last 24h</span>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-border">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage src={author.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">{author.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">{author.name}</span>
            {author.verified && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                PRO
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground ml-auto">
            <span className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" />
              {stars}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              {comments}
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

        {/* Time posted */}
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{postedAt}</span>
        </div>
      </article>
    </Link>
  )
}
