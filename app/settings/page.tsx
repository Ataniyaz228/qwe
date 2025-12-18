"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { SettingsProfile } from "@/components/settings-profile"
import { SettingsAppearance } from "@/components/settings-appearance"
import { SettingsNotifications } from "@/components/settings-notifications"
import { SettingsAccount } from "@/components/settings-account"
import { cn } from "@/lib/utils"
import { User, Palette, Bell, Shield, Loader2, Settings, ChevronRight, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

export default function SettingsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("profile")
  const [mounted, setMounted] = useState(false)

  const tabs = [
    { id: "profile", label: t.settings.tabs.profile, icon: User, description: t.pages.settings.tabDescriptions.profile },
    { id: "appearance", label: t.settings.tabs.appearance, icon: Palette, description: t.pages.settings.tabDescriptions.appearance },
    { id: "notifications", label: t.settings.tabs.notifications, icon: Bell, description: t.pages.settings.tabDescriptions.notifications },
    { id: "account", label: t.settings.tabs.account, icon: Shield, description: t.pages.settings.tabDescriptions.account },
  ]

  useEffect(() => {
    setMounted(true)
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-white/40" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const activeTabData = tabs.find(t => t.id === activeTab)

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-white/[0.008] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-white/[0.008] rounded-full blur-[150px]" />
      </div>

      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56 relative z-10">
          <div className="max-w-5xl px-4 md:px-6 py-4 md:py-6">

            {/* Header */}
            <div className={cn(
              "mb-6 transition-all duration-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            )}>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white/50" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white/90">{t.pages.settings.title}</h1>
                  <p className="text-sm text-white/40">{t.pages.settings.subtitle}</p>
                </div>
              </div>
            </div>

            {/* User Info Banner */}
            {user && (
              <div className={cn(
                "mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] transition-all duration-500 delay-100",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/[0.08] flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-white/40" strokeWidth={1.5} />
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-[#09090b]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white/80">{user.display_name || user.username}</h3>
                    <p className="text-sm text-white/35">@{user.username}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                    <Sparkles className="h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
                    <span className="text-xs text-white/40">Pro</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 pb-20 md:pb-0">
              {/* Tabs Navigation */}
              <nav className={cn(
                "flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:w-56 shrink-0 -mx-3 px-3 md:mx-0 md:px-0 transition-all duration-500 delay-200",
                mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              )}>
                {tabs.map((tab, i) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 group",
                      activeTab === tab.id
                        ? "bg-white/[0.06] text-white/90 border border-white/[0.08]"
                        : "text-white/40 hover:bg-white/[0.03] hover:text-white/60 border border-transparent"
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                      activeTab === tab.id ? "bg-white/[0.08]" : "bg-white/[0.02] group-hover:bg-white/[0.04]"
                    )}>
                      <tab.icon className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 text-left hidden lg:block">
                      <div className={cn(
                        "transition-colors",
                        activeTab === tab.id ? "text-white/90" : "text-white/60"
                      )}>{tab.label}</div>
                      <div className="text-[10px] text-white/25">{tab.description}</div>
                    </div>
                    <ChevronRight className={cn(
                      "h-4 w-4 hidden lg:block transition-all",
                      activeTab === tab.id ? "opacity-100 text-white/50" : "opacity-0"
                    )} strokeWidth={1.5} />
                  </button>
                ))}
              </nav>

              {/* Tab Content */}
              <div className={cn(
                "flex-1 min-w-0 transition-all duration-500 delay-300",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                {/* Tab Header */}
                <div className="flex items-center gap-3 mb-4 px-1">
                  <div className="h-8 w-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                    {activeTabData && <activeTabData.icon className="h-4 w-4 text-white/50" strokeWidth={1.5} />}
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-white/70">{activeTabData?.label}</h2>
                    <p className="text-[11px] text-white/30">{activeTabData?.description}</p>
                  </div>
                </div>

                {/* Content Card */}
                <div className="p-6 rounded-2xl border border-white/[0.04] bg-[#0c0c0e]">
                  <div className="animate-in fade-in-50 duration-300">
                    {activeTab === "profile" && <SettingsProfile />}
                    {activeTab === "appearance" && <SettingsAppearance />}
                    {activeTab === "notifications" && <SettingsNotifications />}
                    {activeTab === "account" && <SettingsAccount />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
