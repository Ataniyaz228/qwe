"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Bell, Plus, LogOut, User, Settings, Loader2, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRouter } from "next/navigation"
import { usersAPI, postsAPI, type User as UserType, type Post } from "@/lib/api"

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{ users: UserType[]; posts: Post[] }>({ users: [], posts: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  // Поиск с debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ users: [], posts: [] })
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const [users, postsData] = await Promise.all([
          usersAPI.search(searchQuery),
          postsAPI.list({ search: searchQuery })
        ])
        const posts = Array.isArray(postsData) ? postsData : postsData.results || []
        setSearchResults({
          users: users.slice(0, 5),
          posts: posts.slice(0, 5)
        })
      } catch (err) {
        console.error("Search error:", err)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const hasResults = searchResults.users.length > 0 || searchResults.posts.length > 0

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/gitforum-logo.svg" alt="GitForum" width={32} height={32} />
          <span className="text-lg font-semibold tracking-tight">GitForum</span>
        </Link>

        {/* Search Bar */}
        <div className="hidden flex-1 max-w-md mx-8 md:block" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t.nav.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              className="w-full pl-9 bg-secondary border-border focus:ring-primary"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}

            {/* Search Results Dropdown */}
            {showResults && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg max-h-[400px] overflow-auto">
                {!hasResults && !isSearching && (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Ничего не найдено
                  </div>
                )}

                {/* Users */}
                {searchResults.users.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-secondary/50">
                      Пользователи
                    </div>
                    {searchResults.users.map((u) => (
                      <Link
                        key={u.id}
                        href={`/user/${u.username}`}
                        onClick={() => { setShowResults(false); setSearchQuery("") }}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatar || "/developer-avatar.png"} />
                          <AvatarFallback>{u.username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{u.display_name || u.username}</div>
                          <div className="text-xs text-muted-foreground">@{u.username}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Posts */}
                {searchResults.posts.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-secondary/50">
                      Посты
                    </div>
                    {searchResults.posts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/post/${p.id}`}
                        onClick={() => { setShowResults(false); setSearchQuery("") }}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                          <FileCode className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{p.title}</div>
                          <div className="text-xs text-muted-foreground">
                            @{p.author?.username} · {p.language}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="hidden md:flex relative">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/new">
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.nav.create}</span>
                </Button>
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || "/developer-avatar.png"} />
                      <AvatarFallback>
                        {user?.display_name?.charAt(0) || user?.username?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.display_name || user?.username}</p>
                      <p className="text-xs text-muted-foreground">@{user?.username}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      {t.nav.profile}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      {t.nav.settings}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t.nav.login}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  {t.nav.register}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
