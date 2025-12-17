"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Compass, Hash, Bookmark, Settings, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    { icon: Home, label: t.nav.home, href: "/feed" },
    { icon: Compass, label: t.nav.explore, href: "/explore" },
    { icon: Hash, label: t.tags.title, href: "/tags" },
    { icon: Bookmark, label: t.nav.bookmarks, href: "/bookmarks" },
    { icon: TrendingUp, label: t.nav.trending, href: "/trending" },
    { icon: Settings, label: t.nav.settings, href: "/settings" },
  ]

  return (
    <aside className="fixed left-0 top-14 z-40 hidden h-[calc(100vh-3.5rem)] w-16 flex-col items-center border-r border-white/[0.04] bg-[#09090b] py-4 md:flex lg:w-56 lg:items-start lg:px-3">
      <nav className="flex flex-col gap-1 w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/40 transition-all duration-200 hover:bg-white/[0.04] hover:text-white/70",
                isActive && "bg-white/[0.06] text-white/90 border border-white/[0.08]",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
              <span className="hidden lg:inline text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
