"use client"

import type React from "react"
import Link from "next/link"
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, GitFork } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PostCardProps {
  id?: string
  filename: string
  language: string
  author: {
    name: string
    username: string
    avatar: string
  }
  timestamp: string
  code: React.ReactNode
  likes: number
  comments: number
  forks: number
  tags: string[]
}

export function PostCard({
  id,
  filename,
  language,
  author,
  timestamp,
  code,
  likes,
  comments,
  forks,
  tags,
}: PostCardProps) {
  const content = (
    <article className="rounded-lg border border-border bg-card overflow-hidden transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 card-hover">
      {/* Post Header - Author Info */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={author.avatar || "/placeholder.svg"} />
            <AvatarFallback>{author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{author.name}</span>
            <span className="text-xs text-muted-foreground">
              @{author.username} · {timestamp}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.preventDefault()}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Code File Header - Mimics VS Code tab */}
      <div className="flex items-center justify-between bg-secondary/50 px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-2 font-mono text-sm text-muted-foreground">{filename}</span>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">
          {language}
        </Badge>
      </div>

      {/* Code Block with Line Numbers */}
      <div className="overflow-x-auto code-scrollbar">
        <pre className="p-4 font-mono text-sm leading-relaxed">{code}</pre>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 px-4 py-3 border-t border-border">
        {tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs font-normal">
            #{tag}
          </Badge>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-red-400"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="h-4 w-4" />
            <span className="text-xs">{likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-primary"
            onClick={(e) => e.preventDefault()}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">{comments}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-green-400"
            onClick={(e) => e.preventDefault()}
          >
            <GitFork className="h-4 w-4" />
            <span className="text-xs">{forks}</span>
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={(e) => e.preventDefault()}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={(e) => e.preventDefault()}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  )

  if (id) {
    return (
      <Link href={`/post/${id}`} className="block">
        {content}
      </Link>
    )
  }

  return content
}
