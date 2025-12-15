import { Heart, GitFork, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ExploreCardProps {
  id: string
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
  featured?: boolean
}

export function ExploreCard({
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
  featured,
}: ExploreCardProps) {
  return (
    <Link href={`/post/${id}`} className="block">
      <article
        className={cn(
          "group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer h-full",
          featured && "row-span-2 flex flex-col",
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn("h-3 w-3 rounded-full shrink-0", languageColor)} />
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{title}</h3>
          </div>
          <Badge variant="secondary" className="font-mono text-xs shrink-0">
            {language}
          </Badge>
        </div>

        {/* Description */}
        <p className={cn("text-sm text-muted-foreground mb-4", featured ? "line-clamp-4 flex-1" : "line-clamp-2")}>
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, featured ? 5 : 3).map((tag) => (
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
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">{author.name}</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground ml-auto">
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
      </article>
    </Link>
  )
}
