import { Bookmark, Search, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function BookmarksEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="p-4 rounded-full bg-muted/50">
          <Bookmark className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-background border border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        Start saving your favorite code snippets and repositories to access them quickly later.
      </p>

      <Link href="/explore">
        <Button className="gap-2">
          <Compass className="h-4 w-4" />
          Explore Snippets
        </Button>
      </Link>
    </div>
  )
}
