"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { SettingsProfile } from "@/components/settings-profile"
import { SettingsAppearance } from "@/components/settings-appearance"
import { SettingsNotifications } from "@/components/settings-notifications"
import { SettingsAccount } from "@/components/settings-account"
import { cn } from "@/lib/utils"
import { User, Palette, Bell, Shield } from "lucide-react"

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: Shield },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56">
          <div className="mx-auto max-w-4xl px-4 py-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-1">Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Tabs Navigation */}
              <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 lg:w-48 shrink-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <tab.icon className="h-4 w-4 shrink-0" />
                    {tab.label}
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
