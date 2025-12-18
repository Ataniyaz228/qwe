"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Bell, Plus, LogOut, User, Settings, Loader2, FileCode, Command, Bookmark, Sparkles } from "lucide-react"
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
import { usersAPI, postsAPI, notificationsAPI, type User as UserType, type Post } from "@/lib/api"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{ users: UserType[]; posts: Post[] }>({ users: [], posts: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  // Fetch unread notifications count
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchUnread = async () => {
      try {
        const notifications = await notificationsAPI.list()
        const unread = notifications.filter((n: any) => !n.is_read).length
        setUnreadCount(unread)
      } catch (err) {
        console.error("Error fetching notifications:", err)
      }
    }

    fetchUnread()
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Keyboard shortcut for search (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === "Escape") {
        setShowResults(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

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
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.04] bg-[#09090b]/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#09090b]/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Image src="/gitforum-logo.png" alt="GitForum" width={32} height={32} className="transition-all duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <span className="text-base font-semibold text-white/80 tracking-tight group-hover:text-white transition-colors duration-300">GitForum</span>
        </Link>

        {/* Search */}
        <div className="hidden flex-1 max-w-md mx-8 md:block" ref={searchRef}>
          <div className="relative group">
            <Search className={cn(
              "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-all duration-300",
              isFocused ? "text-white/60" : "text-white/25"
            )} strokeWidth={1.5} />
            <Input
              ref={inputRef}
              type="search"
              placeholder={t.nav.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { setShowResults(true); setIsFocused(true) }}
              onBlur={() => setIsFocused(false)}
              className="w-full h-9 pl-9 pr-16 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/30 focus:border-white/[0.15] focus:bg-white/[0.06] focus-visible:ring-0 transition-all duration-300 rounded-xl"
            />
            {/* Keyboard shortcut hint */}
            <div className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity duration-300",
              isFocused ? "opacity-0" : "opacity-100"
            )}>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-white/25 bg-white/[0.04] border border-white/[0.06] rounded">
                ⌘K
              </kbd>
            </div>
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/30" />
            )}

            {/* Results Dropdown */}
            {showResults && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c0c0e] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 max-h-[400px] overflow-auto animate-in fade-in slide-in-from-top-2 duration-200">
                {!hasResults && !isSearching && (
                  <div className="p-6 text-center">
                    <Search className="h-8 w-8 mx-auto mb-2 text-white/10" strokeWidth={1} />
                    <p className="text-white/30 text-sm">{t.search.noResults}</p>
                  </div>
                )}

                {searchResults.users.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-[10px] font-medium text-white/30 uppercase tracking-wider bg-white/[0.02] border-b border-white/[0.04] flex items-center gap-2">
                      <User className="h-3 w-3" strokeWidth={1.5} />
                      {t.search.users}
                    </div>
                    {searchResults.users.map((u, i) => (
                      <Link
                        key={u.id}
                        href={`/user/${u.username}`}
                        onClick={() => { setShowResults(false); setSearchQuery("") }}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <Avatar className="h-8 w-8 border border-white/[0.08]">
                          <AvatarImage src={u.avatar || "/developer-avatar.png"} />
                          <AvatarFallback className="bg-white/[0.04] text-white/40 text-[10px]">{u.username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-white/70">{u.display_name || u.username}</div>
                          <div className="text-[11px] text-white/30">@{u.username}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.posts.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-[10px] font-medium text-white/30 uppercase tracking-wider bg-white/[0.02] border-b border-white/[0.04] flex items-center gap-2">
                      <FileCode className="h-3 w-3" strokeWidth={1.5} />
                      {t.search.posts}
                    </div>
                    {searchResults.posts.map((p, i) => (
                      <Link
                        key={p.id}
                        href={`/post/${p.id}`}
                        onClick={() => { setShowResults(false); setSearchQuery("") }}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06]">
                          <FileCode className="h-3.5 w-3.5 text-white/40" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white/70 truncate">{p.title}</div>
                          <div className="text-[11px] text-white/30 flex items-center gap-1.5">
                            <span>@{p.author?.username}</span>
                            <span className="text-white/15">·</span>
                            <span className="font-mono text-white/25">{p.language}</span>
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
        <div className="flex items-center gap-1.5">
          {isAuthenticated ? (
            <>
              {/* Notification Bell with Badge */}
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative hidden md:flex h-9 w-9 text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-xl transition-all duration-300">
                  <Bell className="h-4 w-4" strokeWidth={1.5} />
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-blue-500 text-[10px] font-medium text-white flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                      <span className="absolute top-1 right-1 h-4 min-w-[16px] rounded-full bg-blue-500 animate-ping opacity-75" />
                    </>
                  )}
                </Button>
              </Link>

              {/* Create Button */}
              <Link href="/new">
                <Button size="sm" className="h-8 gap-1.5 bg-white text-black hover:bg-white/90 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/10">
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  <span className="hidden sm:inline">{t.nav.create}</span>
                </Button>
              </Link>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-xl hover:bg-white/[0.04] transition-all duration-300 group">
                    <Avatar className="h-7 w-7 border border-white/[0.08] group-hover:border-white/[0.15] transition-all duration-300">
                      <AvatarImage src={user?.avatar || "/developer-avatar.png"} />
                      <AvatarFallback className="bg-white/[0.04] text-white/50 text-[10px]">
                        {user?.display_name?.charAt(0) || user?.username?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60 bg-[#0c0c0e] border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 p-0" align="end" forceMount>
                  {/* User Info Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent">
                    <Avatar className="h-10 w-10 border-2 border-white/[0.1]">
                      <AvatarImage src={user?.avatar || "/developer-avatar.png"} />
                      <AvatarFallback className="bg-white/[0.04] text-white/50 text-sm">
                        {user?.display_name?.charAt(0) || user?.username?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/90 truncate">{user?.display_name || user?.username}</p>
                      <p className="text-[11px] text-white/40">@{user?.username}</p>
                    </div>
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/[0.06] text-[9px] text-white/40">
                      <Sparkles className="h-2.5 w-2.5" strokeWidth={2} />
                      Pro
                    </span>
                  </div>

                  {/* Menu Items */}
                  <div className="p-1.5">
                    <DropdownMenuItem asChild className="rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] cursor-pointer py-2.5">
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-3 h-4 w-4" strokeWidth={1.5} />
                        {t.nav.profile}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] cursor-pointer py-2.5">
                      <Link href="/bookmarks" className="flex items-center">
                        <Bookmark className="mr-3 h-4 w-4" strokeWidth={1.5} />
                        {t.nav.bookmarks}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] cursor-pointer py-2.5">
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-3 h-4 w-4" strokeWidth={1.5} />
                        {t.nav.settings}
                      </Link>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator className="bg-white/[0.06] my-1" />

                  <div className="p-1.5">
                    <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer py-2.5">
                      <LogOut className="mr-3 h-4 w-4" strokeWidth={1.5} />
                      {t.nav.logout}
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white/50 hover:text-white/80 hover:bg-white/[0.04] rounded-xl transition-all duration-300">
                  {t.nav.login}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-white text-black hover:bg-white/90 rounded-xl font-medium transition-all duration-300 hover:scale-105">
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
