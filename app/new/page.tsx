"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { X, Eye, Code, FileCode, Sparkles, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { postsAPI } from "@/lib/api"
import { toast } from "sonner"

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
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

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

    if (!title.trim()) {
      newErrors.title = "Введите заголовок"
    }
    if (!filename.trim()) {
      newErrors.filename = "Введите имя файла"
    }
    if (!language) {
      newErrors.language = "Выберите язык"
    }
    if (!code.trim()) {
      newErrors.code = "Введите код"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    if (!isAuthenticated) {
      toast.error("Войдите в аккаунт, чтобы создать пост")
      router.push("/login")
      return
    }

    setIsSubmitting(true)
    try {
      const post = await postsAPI.create({
        title,
        filename,
        language,
        code,
        description,
        is_public: isPublic,
        tags,
      })

      toast.success("Пост успешно опубликован!")
      router.push("/feed")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка"
      toast.error("Ошибка создания поста: " + message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = () => {
    // TODO: Сохранение черновика в localStorage
    localStorage.setItem("draft_post", JSON.stringify({
      title, description, code, language, filename, tags, isPublic
    }))
    toast.success("Черновик сохранён")
  }

  const selectedLang = languages.find((l) => l.value === language)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-56 p-4 md:p-6 pb-24 md:pb-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <FileCode className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">Новый пост</h1>
                  <p className="text-xs md:text-sm text-muted-foreground">Поделитесь кодом с сообществом</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label className="text-sm text-muted-foreground">
                    {isPublic ? "Публичный" : "Приватный"}
                  </Label>
                </div>
                <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSubmitting} className="hidden sm:flex">
                  Сохранить
                </Button>
                <Button onClick={handleSubmit} size="sm" disabled={isSubmitting} className="gap-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Публикация...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline">Опубликовать</span>
                      <span className="sm:hidden">Создать</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Заголовок</Label>
                <Input
                  id="title"
                  placeholder="Например: Кастомный React хук для debounce"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`bg-card border-border ${errors.title ? 'border-destructive' : ''}`}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Кратко опишите, что делает ваш код и как его использовать..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-card border-border min-h-[100px]"
                />
              </div>

              {/* Language & Filename */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Язык</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className={`bg-card border-border ${errors.language ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Выберите язык" />
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
                  {errors.language && <p className="text-xs text-destructive">{errors.language}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filename">Имя файла</Label>
                  <Input
                    id="filename"
                    placeholder="Например: useDebounce.ts"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className={`bg-card border-border font-mono ${errors.filename ? 'border-destructive' : ''}`}
                  />
                  {errors.filename && <p className="text-xs text-destructive">{errors.filename}</p>}
                </div>
              </div>

              {/* Code Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Код</Label>
                  <div className="flex rounded-lg bg-secondary p-0.5">
                    <button
                      onClick={() => setActiveTab("write")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === "write"
                        ? "bg-card text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <Code className="h-4 w-4" />
                      Редактор
                    </button>
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === "preview"
                        ? "bg-card text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <Eye className="h-4 w-4" />
                      Превью
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
                      placeholder="// Вставьте ваш код здесь..."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className={`bg-card border-border font-mono text-sm min-h-[300px] pt-10 rounded-t-lg ${errors.code ? 'border-destructive' : ''}`}
                    />
                    {errors.code && <p className="text-xs text-destructive mt-1">{errors.code}</p>}
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
                      <code className="text-foreground">{code || "// Превью появится здесь..."}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Теги (максимум 5)</Label>
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
                  placeholder="Добавьте теги (Enter или запятая для добавления)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  disabled={tags.length >= 5}
                  className="bg-card border-border"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-xs text-muted-foreground mr-1">Предложения:</span>
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
