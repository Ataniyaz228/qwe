import { TrendingUp, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const trendingRepos = [
  { name: "react-query-utils", author: "tanstack", stars: "2.4k" },
  { name: "next-auth-helpers", author: "authjs", stars: "1.8k" },
  { name: "tailwind-animate", author: "jamiebuilds", stars: "956" },
  { name: "zod-form-data", author: "airjp73", stars: "742" },
]

const topContributors = [
  { name: "Sarah Chen", username: "sarahcodes", avatar: "/female-developer.png", posts: 142 },
  { name: "Alex Rivera", username: "arivera", avatar: "/male-developer.png", posts: 98 },
  { name: "Jordan Kim", username: "jkim_dev", avatar: "/developer-portrait.png", posts: 87 },
]

export function Widgets() {
  return (
    <aside className="hidden xl:block w-72 shrink-0">
      <div className="sticky top-[4.5rem] flex flex-col gap-4">
        {/* Trending Repos */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Trending Repos</h3>
          </div>
          <div className="flex flex-col gap-3">
            {trendingRepos.map((repo) => (
              <a
                key={repo.name}
                href="#"
                className="flex items-center justify-between hover:bg-secondary/50 -mx-2 px-2 py-1.5 rounded-md transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-primary">{repo.name}</span>
                  <span className="text-xs text-muted-foreground">@{repo.author}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                  <span className="text-xs">{repo.stars}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-semibold text-sm mb-4">Top Contributors</h3>
          <div className="flex flex-col gap-3">
            {topContributors.map((contributor, index) => (
              <a
                key={contributor.username}
                href="#"
                className="flex items-center gap-3 hover:bg-secondary/50 -mx-2 px-2 py-1.5 rounded-md transition-colors"
              >
                <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={contributor.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{contributor.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">{contributor.name}</span>
                  <span className="text-xs text-muted-foreground">@{contributor.username}</span>
                </div>
                <span className="text-xs text-muted-foreground">{contributor.posts} posts</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
