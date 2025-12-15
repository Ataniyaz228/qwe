"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { X, Eye, Code, FileCode, Sparkles } from "lucide-react"

const languages = [
  { value: "javascript", label: "JavaScript", color: "bg-yellow-500" },
  { value: "typescript", label: "TypeScript", color: "bg-blue-500" },
  { value: "python", label: "Python", color: "bg-green-500" },
  { value: "rust", label: "Rust", color: "bg-orange-500" },
  { value: "go", label: "Go", color: "bg-cyan-500" },
  { value: "java", label: "Java", color: "bg-red-500" },
  { value: "csharp", label: "C#", color: "bg-purple-500" },
  { value: "cpp", label: "C++", color: "bg-pink-500" },
  { value: "html", label: "HTML", color: "bg-orange-400" },
  { value: "css", label: "CSS", color: "bg-blue-400" },
  { value: "sql", label: "SQL", color: "bg-emerald-500" },
  { value: "shell", label: "Shell/Bash", color: "bg-slate-500" },
]

const suggestedTags = [
  "react",
  "hooks",
  "api",
  "async",
  "algorithm",
  "utility",
  "component",
  "backend",
  "frontend",
  "database",
  "auth",
]

export default function NewPostPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("")
  const [filename, setFilename] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")

  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim()
    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < 5) {
      setTags([...tags, normalizedTag])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  const selectedLang = languages.find((l) => l.value === language)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-16 lg:ml-56 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileCode className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Create New Post</h1>
                  <p className="text-sm text-muted-foreground">Share your code snippet with the community</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-4">
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label className="text-sm text-muted-foreground">{isPublic ? "Public" : "Private"}</Label>
                </div>
                <Button variant="outline">Save Draft</Button>
                <Button className="gap-1">
                  <Sparkles className="h-4 w-4" />
                  Publish
                </Button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Custom React Hook for Debouncing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-card border-border"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Briefly describe what your code does and how to use it..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-card border-border min-h-[100px]"
                />
              </div>

              {/* Language & Filename */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${lang.color}`} />
                            {lang.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filename">Filename</Label>
                  <Input
                    id="filename"
                    placeholder="e.g., useDebounce.ts"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="bg-card border-border font-mono"
                  />
                </div>
              </div>

              {/* Code Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Code</Label>
                  <div className="flex rounded-lg bg-secondary p-0.5">
                    <button
                      onClick={() => setActiveTab("write")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                        activeTab === "write"
                          ? "bg-card text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Code className="h-4 w-4" />
                      Write
                    </button>
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                        activeTab === "preview"
                          ? "bg-card text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                  </div>
                </div>

                {activeTab === "write" ? (
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 flex items-center h-8 px-3 bg-secondary/50 border border-border rounded-t-lg">
                      <div className="flex items-center gap-1.5 mr-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                      </div>
                      {filename && <span className="text-xs text-muted-foreground font-mono">{filename}</span>}
                      {selectedLang && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          <div className={`h-1.5 w-1.5 rounded-full ${selectedLang.color} mr-1.5`} />
                          {selectedLang.label}
                        </Badge>
                      )}
                    </div>
                    <Textarea
                      placeholder="// Paste your code here..."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="bg-card border-border font-mono text-sm min-h-[300px] pt-10 rounded-t-lg"
                    />
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center h-8 px-3 bg-secondary/50 border-b border-border">
                      <div className="flex items-center gap-1.5 mr-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                      </div>
                      {filename && <span className="text-xs text-muted-foreground font-mono">{filename}</span>}
                    </div>
                    <pre className="p-4 font-mono text-sm min-h-[300px] overflow-auto">
                      <code className="text-foreground">{code || "// Preview will appear here..."}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags (max 5)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pl-2">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tags (press Enter or comma to add)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  disabled={tags.length >= 5}
                  className="bg-card border-border"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-xs text-muted-foreground mr-1">Suggested:</span>
                  {suggestedTags
                    .filter((t) => !tags.includes(t))
                    .slice(0, 6)
                    .map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        disabled={tags.length >= 5}
                        className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        #{tag}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
