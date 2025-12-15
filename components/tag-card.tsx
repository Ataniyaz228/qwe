import { Hash, FileCode, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface TagCardProps {
  name: string
  icon: string
  color: string
  snippets: number
  trending?: boolean
  description: string
}

export function TagCard({ name, icon, color, snippets, trending, description }: TagCardProps) {
  return (
    <Link href={`/explore?tag=${encodeURIComponent(name.toLowerCase())}`} className="block">
      <article
        className={cn(
          "group relative rounded-lg border border-border bg-card p-5 transition-all",
          "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
          "flex flex-col gap-4 cursor-pointer",
        )}
      >
        {/* Trending Badge */}
        {trending && (
          <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
            <TrendingUp className="h-3 w-3" />
            Trending
          </div>
        )}

        {/* Header with Icon */}
        <div className="flex items-start gap-3">
          <div
            className={cn("flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold shrink-0", color)}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              {name}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
              <FileCode className="h-3.5 w-3.5" />
              <span>{snippets.toLocaleString()} snippets</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>

        {/* Hover Glow Effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity -z-10",
            "bg-gradient-to-br blur-xl",
            color.replace("bg-", "from-").replace("/20", "/10"),
            "to-transparent",
          )}
        />
      </article>
    </Link>
  )
}
