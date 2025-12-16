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
import { User, Palette, Bell, Shield, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

export default function SettingsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("profile")

  const tabs = [
    { id: "profile", label: t.settings.tabs.profile, icon: User },
    { id: "appearance", label: t.settings.tabs.appearance, icon: Palette },
    { id: "notifications", label: t.settings.tabs.notifications, icon: Bell },
    { id: "account", label: t.settings.tabs.account, icon: Shield },
  ]

  // Редирект если не авторизован
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Не отображаем страницу если не авторизован
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56">
          <div className="max-w-5xl px-4 md:px-6 py-4 md:py-6">
            {/* Header */}
            <div className="mb-4 md:mb-8">
              <h1 className="text-xl md:text-2xl font-bold mb-1">Настройки</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Управление аккаунтом и предпочтениями</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 md:gap-6 pb-20 md:pb-0">
              {/* Tabs Navigation */}
              <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 lg:w-48 shrink-0 scrollbar-thin -mx-3 px-3 md:mx-0 md:px-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <tab.icon className="h-4 w-4 shrink-0" />
                    <span className="hidden xs:inline sm:inline">{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* Tab Content */}
              <div className="flex-1 min-w-0">
                <div className="p-6 rounded-lg border border-border bg-card">
                  {activeTab === "profile" && <SettingsProfile />}
                  {activeTab === "appearance" && <SettingsAppearance />}
                  {activeTab === "notifications" && <SettingsNotifications />}
                  {activeTab === "account" && <SettingsAccount />}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
