"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { X, Eye, Code, FileCode, Sparkles, Loader2, Hash, Save, Globe, Lock, FileText, Type } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { postsAPI } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"

const languages = [
  { value: "javascript", label: "JavaScript", dot: "bg-yellow-400" },
  { value: "typescript", label: "TypeScript", dot: "bg-blue-400" },
  { value: "python", label: "Python", dot: "bg-green-400" },
  { value: "rust", label: "Rust", dot: "bg-orange-400" },
  { value: "go", label: "Go", dot: "bg-cyan-400" },
  { value: "java", label: "Java", dot: "bg-red-400" },
  { value: "csharp", label: "C#", dot: "bg-purple-400" },
  { value: "cpp", label: "C++", dot: "bg-pink-400" },
  { value: "html", label: "HTML", dot: "bg-orange-300" },
  { value: "css", label: "CSS", dot: "bg-blue-300" },
  { value: "sql", label: "SQL", dot: "bg-emerald-400" },
  { value: "shell", label: "Shell/Bash", dot: "bg-slate-400" },
]

const suggestedTags = [
  "react", "hooks", "api", "async", "algorithm", "utility",
  "component", "backend", "frontend", "database", "auth",
]

export default function NewPostPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { t } = useLanguage()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("")
  const [filename, setFilename] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = t.validation.enterTitle
    if (!filename.trim()) newErrors.filename = t.validation.enterFilename
    if (!language) newErrors.language = t.validation.selectLanguage
    if (!code.trim()) newErrors.code = t.validation.enterCode

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    if (!isAuthenticated) {
      toast.error(t.newPost.loginRequired)
      router.push("/login")
      return
    }

    setIsSubmitting(true)
    try {
      await postsAPI.create({
        title,
        filename,
        language,
        code,
        description,
        is_public: isPublic,
        tags,
      })

      toast.success(t.newPost.published)
      router.push("/feed")
    } catch (err) {
      const message = err instanceof Error ? err.message : t.common.error
      toast.error(t.common.error + ": " + message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = () => {
    localStorage.setItem("draft_post", JSON.stringify({
      title, description, code, language, filename, tags, isPublic
    }))
    toast.success(t.newPost.draftSaved)
  }

  const selectedLang = languages.find((l) => l.value === language)

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
        <main className="flex-1 md:ml-16 lg:ml-56 p-4 md:p-6 pb-24 md:pb-6 relative z-10">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className={cn(
              "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 transition-all duration-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            )}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/[0.08] flex items-center justify-center">
                  <FileCode className="h-5 w-5 text-white/50" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white/90">{t.newPost.title}</h1>
                  <p className="text-xs text-white/35">{t.newPost.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  <span className="text-xs text-white/40 flex items-center gap-1.5">
                    {isPublic ? <Globe className="h-3 w-3" strokeWidth={1.5} /> : <Lock className="h-3 w-3" strokeWidth={1.5} />}
                    {isPublic ? t.newPost.public : t.newPost.private}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="hidden sm:flex gap-1.5 bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.05] hover:text-white/70 rounded-lg"
                >
                  <Save className="h-4 w-4" strokeWidth={1.5} />
                  {t.newPost.draft}
                </Button>
                <Button
                  onClick={handleSubmit}
                  size="sm"
                  disabled={isSubmitting}
                  className="gap-1.5 bg-white text-black hover:bg-white/90 rounded-lg font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">{t.newPost.publishing}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" strokeWidth={2} />
                      <span className="hidden sm:inline">{t.newPost.publish}</span>
                      <span className="sm:hidden">{t.newPost.create}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Form */}
            <div className={cn(
              "space-y-5 transition-all duration-500 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              {/* Title */}
              <div className="space-y-2 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <Label htmlFor="title" className="text-xs text-white/50 flex items-center gap-2">
                  <Type className="h-3 w-3" strokeWidth={1.5} />
                  {t.newPost.titleLabel}
                </Label>
                <Input
                  id="title"
                  placeholder={t.newPost.titlePlaceholder}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={cn(
                    "h-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.12] focus-visible:ring-0 rounded-xl",
                    errors.title && "border-red-500/50"
                  )}
                />
                {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <Label htmlFor="description" className="text-xs text-white/50 flex items-center gap-2">
                  <FileText className="h-3 w-3" strokeWidth={1.5} />
                  {t.newPost.descriptionLabel}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t.newPost.descriptionPlaceholder}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.12] focus-visible:ring-0 rounded-xl min-h-[100px] resize-none"
                />
              </div>

              {/* Language & Filename */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <Label className="text-xs text-white/50 flex items-center gap-2">
                    <Code className="h-3 w-3" strokeWidth={1.5} />
                    {t.newPost.languageLabel}
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className={cn(
                      "h-10 bg-white/[0.03] border-white/[0.06] text-white rounded-xl",
                      errors.language && "border-red-500/50"
                    )}>
                      <SelectValue placeholder={t.newPost.selectLanguage} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0c0c0e] border-white/[0.06]">
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          <div className="flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full", lang.dot)} />
                            {lang.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.language && <p className="text-xs text-red-400">{errors.language}</p>}
                </div>
                <div className="space-y-2 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <Label htmlFor="filename" className="text-xs text-white/50 flex items-center gap-2">
                    <FileCode className="h-3 w-3" strokeWidth={1.5} />
                    {t.newPost.filenameLabel}
                  </Label>
                  <Input
                    id="filename"
                    placeholder={t.newPost.filenamePlaceholder}
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className={cn(
                      "h-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.12] focus-visible:ring-0 rounded-xl font-mono",
                      errors.filename && "border-red-500/50"
                    )}
                  />
                  {errors.filename && <p className="text-xs text-red-400">{errors.filename}</p>}
                </div>
              </div>

              {/* Code Editor */}
              <div className="space-y-2 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs text-white/50">{t.newPost.codeLabel}</Label>
                  <div className="flex rounded-lg bg-white/[0.02] border border-white/[0.04] p-0.5">
                    <button
                      onClick={() => setActiveTab("write")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all",
                        activeTab === "write"
                          ? "bg-white/[0.08] text-white/80"
                          : "text-white/35 hover:text-white/60"
                      )}
                    >
                      <Code className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {t.newPost.editor}
                    </button>
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all",
                        activeTab === "preview"
                          ? "bg-white/[0.08] text-white/80"
                          : "text-white/35 hover:text-white/60"
                      )}
                    >
                      <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {t.newPost.preview}
                    </button>
                  </div>
                </div>

                {activeTab === "write" ? (
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 flex items-center h-10 px-4 bg-white/[0.02] border border-white/[0.04] border-b-0 rounded-t-xl">
                      <div className="flex items-center gap-1.5 mr-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-white/[0.1]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/[0.1]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/[0.1]" />
                      </div>
                      {filename && <span className="text-[10px] text-white/30 font-mono">{filename}</span>}
                      {selectedLang && (
                        <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.04]">
                          <span className={cn("h-1.5 w-1.5 rounded-full", selectedLang.dot)} />
                          <span className="text-[10px] text-white/40">{selectedLang.label}</span>
                        </div>
                      )}
                    </div>
                    <Textarea
                      placeholder={t.newPost.codePlaceholder}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className={cn(
                        "bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/20 focus:border-white/[0.12] focus-visible:ring-0 font-mono text-sm min-h-[300px] pt-12 rounded-xl",
                        errors.code && "border-red-500/50"
                      )}
                    />
                    {errors.code && <p className="text-xs text-red-400 mt-1">{errors.code}</p>}
                  </div>
                ) : (
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl overflow-hidden">
                    <div className="flex items-center h-10 px-4 bg-white/[0.02] border-b border-white/[0.04]">
                      <div className="flex items-center gap-1.5 mr-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-white/[0.1]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/[0.1]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/[0.1]" />
                      </div>
                      {filename && <span className="text-[10px] text-white/30 font-mono">{filename}</span>}
                    </div>
                    <pre className="p-4 font-mono text-sm min-h-[300px] overflow-auto">
                      <code className="text-white/70">{code || t.newPost.previewPlaceholder}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <Label className="text-xs text-white/50 flex items-center gap-2">
                  <Hash className="h-3 w-3" strokeWidth={1.5} />
                  {t.newPost.tagsLabel} ({t.newPost.tagsMax})
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white/60">
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-white/30 hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" strokeWidth={2} />
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  placeholder={t.newPost.addTagPlaceholder}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  disabled={tags.length >= 5}
                  className="h-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/[0.12] focus-visible:ring-0 rounded-xl"
                />
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-[10px] text-white/25 mr-1">{t.newPost.suggestions}</span>
                  {suggestedTags
                    .filter((t) => !tags.includes(t))
                    .slice(0, 6)
                    .map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        disabled={tags.length >= 5}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-white/[0.03] text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
