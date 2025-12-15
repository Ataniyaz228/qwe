"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Compass, Hash, Bookmark, Settings, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: Home, label: "Home", href: "/feed" },
  { icon: Compass, label: "Explore", href: "/explore" },
  { icon: Hash, label: "Tags", href: "/tags" },
  { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
  { icon: TrendingUp, label: "Trending", href: "/trending" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-14 z-40 hidden h-[calc(100vh-3.5rem)] w-16 flex-col items-center border-r border-border bg-card py-4 md:flex lg:w-56 lg:items-start lg:px-3">
      <nav className="flex flex-col gap-1 w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                isActive && "bg-primary/10 text-primary shadow-[0_0_12px_rgba(59,130,246,0.3)]",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="hidden lg:inline text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
