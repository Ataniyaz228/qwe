"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  LinkIcon,
  Github,
  Twitter,
  Calendar,
  Star,
  GitFork,
  MessageSquare,
  Code2,
  Heart,
  Bookmark,
  Settings,
  Share2,
} from "lucide-react"
import Link from "next/link"

const userProfile = {
  username: "alexdev",
  displayName: "Alex Johnson",
  avatar: "/developer-avatar.png",
  bio: "Full-stack developer passionate about clean code and open source. Building tools that make developers' lives easier.",
  location: "San Francisco, CA",
  website: "https://alexdev.io",
  github: "alexdev",
  twitter: "alexdev_",
  joinedDate: "January 2023",
  isVerified: true,
  stats: {
    posts: 47,
    stars: 1284,
    followers: 892,
    following: 156,
  },
}

const userPosts = [
  {
    id: "1",
    title: "useDebounce.ts",
    language: "TypeScript",
    description: "A custom React hook for debouncing values",
    stars: 234,
    forks: 45,
    comments: 12,
    createdAt: "2 days ago",
  },
  {
    id: "2",
    title: "api-client.ts",
    language: "TypeScript",
    description: "Type-safe API client with automatic retry",
    stars: 189,
    forks: 32,
    comments: 8,
    createdAt: "1 week ago",
  },
  {
    id: "3",
    title: "auth-middleware.ts",
    language: "TypeScript",
    description: "JWT authentication middleware for Express",
    stars: 156,
    forks: 28,
    comments: 15,
    createdAt: "2 weeks ago",
  },
]

const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-500",
  Python: "bg-green-500",
  Rust: "bg-orange-500",
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("posts")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-primary/20">
                    <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">{userProfile.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{userProfile.displayName}</h1>
                        {userProfile.isVerified && (
                          <Badge className="bg-primary/20 text-primary border-0">Verified</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">@{userProfile.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                      <Link href="/settings">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Edit Profile
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <p className="mt-3 text-foreground/90">{userProfile.bio}</p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                    {userProfile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {userProfile.location}
                      </span>
                    )}
                    {userProfile.website && (
                      <a
                        href={userProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <LinkIcon className="h-4 w-4" />
                        {userProfile.website.replace("https://", "")}
                      </a>
                    )}
                    {userProfile.github && (
                      <a
                        href={`https://github.com/${userProfile.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Github className="h-4 w-4" />
                        {userProfile.github}
                      </a>
                    )}
                    {userProfile.twitter && (
                      <a
                        href={`https://twitter.com/${userProfile.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Twitter className="h-4 w-4" />
                        {userProfile.twitter}
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {userProfile.joinedDate}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 mt-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-xl font-bold">{userProfile.stats.posts}</p>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">{userProfile.stats.stars}</p>
                      <p className="text-xs text-muted-foreground">Stars</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">{userProfile.stats.followers}</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">{userProfile.stats.following}</p>
                      <p className="text-xs text-muted-foreground">Following</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start bg-card border border-border h-auto p-1 gap-1">
                <TabsTrigger
                  value="posts"
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Code2 className="h-4 w-4" />
                  Posts
                </TabsTrigger>
                <TabsTrigger
                  value="liked"
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Heart className="h-4 w-4" />
                  Liked
                </TabsTrigger>
                <TabsTrigger
                  value="bookmarks"
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Bookmark className="h-4 w-4" />
                  Bookmarks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-4 space-y-4">
                {userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`h-3 w-3 rounded-full ${languageColors[post.language] || "bg-gray-500"}`} />
                          <span className="text-sm text-muted-foreground">{post.language}</span>
                        </div>
                        <h3 className="font-semibold font-mono text-primary hover:underline cursor-pointer">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{post.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{post.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {post.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="h-4 w-4" />
                        {post.forks}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="liked" className="mt-4">
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No liked posts yet</h3>
                  <p className="text-sm text-muted-foreground">Posts you like will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="bookmarks" className="mt-4">
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No bookmarks yet</h3>
                  <p className="text-sm text-muted-foreground">Save posts to view them later</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
