"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, PlusCircle, Bell, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/feed", icon: Home, label: "Лента" },
    { href: "/explore", icon: Search, label: "Поиск" },
    { href: "/new", icon: PlusCircle, label: "Создать" },
    { href: "/notifications", icon: Bell, label: "Уведом." },
    { href: "/profile", icon: User, label: "Профиль" },
]

export function MobileNav() {
    const pathname = usePathname()
    const { isAuthenticated } = useAuth()

    // На лендинге и авторизации не показываем
    if (pathname === "/" || pathname === "/login" || pathname === "/register") {
        return null
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 flex flex-row justify-around items-center z-50 md:hidden">
            {navItems.map((item) => {
                // Скрываем некоторые пункты для неавторизованных
                if (!isAuthenticated && (item.href === "/new" || item.href === "/notifications" || item.href === "/profile")) {
                    return null
                }

                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[60px]",
                            isActive
                                ? "text-primary bg-primary/10"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        <span className="text-[10px]">{item.label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
