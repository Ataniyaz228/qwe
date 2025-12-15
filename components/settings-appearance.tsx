"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Monitor, Moon, Sun, Save, Loader2 } from "lucide-react"

const codeThemes = [
  { value: "github-dark", label: "GitHub Dark" },
  { value: "dracula", label: "Dracula" },
  { value: "monokai", label: "Monokai" },
  { value: "nord", label: "Nord" },
  { value: "one-dark", label: "One Dark Pro" },
]

const codeFonts = [
  { value: "jetbrains-mono", label: "JetBrains Mono" },
  { value: "fira-code", label: "Fira Code" },
  { value: "source-code-pro", label: "Source Code Pro" },
  { value: "cascadia-code", label: "Cascadia Code" },
]

export function SettingsAppearance() {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [appearance, setAppearance] = useState({
    theme: "dark",
    codeTheme: "github-dark",
    codeFont: "jetbrains-mono",
    fontSize: 14,
    lineNumbers: true,
    wordWrap: false,
  })

  useEffect(() => {
    const savedTheme = localStorage.getItem("gitforum-theme")
    const savedAppearance = localStorage.getItem("gitforum-appearance")

    if (savedTheme) {
      setAppearance((prev) => ({ ...prev, theme: savedTheme }))
    }
    if (savedAppearance) {
      try {
        const parsed = JSON.parse(savedAppearance)
        setAppearance((prev) => ({ ...prev, ...parsed }))
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  const applyTheme = (theme: string) => {
    const root = document.documentElement

    if (theme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", systemDark)
    } else {
      root.classList.toggle("dark", theme === "dark")
    }

    localStorage.setItem("gitforum-theme", theme)
  }

  const handleThemeChange = (theme: string) => {
    setAppearance({ ...appearance, theme })
    applyTheme(theme)
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    localStorage.setItem(
      "gitforum-appearance",
      JSON.stringify({
        codeTheme: appearance.codeTheme,
        codeFont: appearance.codeFont,
        fontSize: appearance.fontSize,
        lineNumbers: appearance.lineNumbers,
        wordWrap: appearance.wordWrap,
      }),
    )

    setSaving(false)
    toast({
      title: "Preferences saved",
      description: "Your appearance settings have been updated.",
    })
  }

  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-1">Theme</h3>
          <p className="text-sm text-muted-foreground">Select your preferred color scheme</p>
        </div>
        <RadioGroup value={appearance.theme} onValueChange={handleThemeChange} className="grid grid-cols-3 gap-4">
          {[
            { value: "light", label: "Light", icon: Sun },
            { value: "dark", label: "Dark", icon: Moon },
            { value: "system", label: "System", icon: Monitor },
          ].map((option) => (
            <Label
              key={option.value}
              htmlFor={option.value}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                appearance.theme === option.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-muted-foreground/50"
              }`}
            >
              <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
              <option.icon className="h-6 w-6" />
              <span className="text-sm font-medium">{option.label}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Code Editor Theme */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold mb-1">Code Theme</h3>
          <p className="text-sm text-muted-foreground">Syntax highlighting theme for code blocks</p>
        </div>
        <Select
          value={appearance.codeTheme}
          onValueChange={(value) => setAppearance({ ...appearance, codeTheme: value })}
        >
          <SelectTrigger className="w-full max-w-xs bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {codeThemes.map((theme) => (
              <SelectItem key={theme.value} value={theme.value}>
                {theme.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Code Font */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold mb-1">Code Font</h3>
          <p className="text-sm text-muted-foreground">Font family for code snippets</p>
        </div>
        <Select
          value={appearance.codeFont}
          onValueChange={(value) => setAppearance({ ...appearance, codeFont: value })}
        >
          <SelectTrigger className="w-full max-w-xs bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {codeFonts.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Font Size</h3>
            <p className="text-sm text-muted-foreground">Code editor font size</p>
          </div>
          <span className="text-sm font-mono bg-card px-2 py-1 rounded border border-border">
            {appearance.fontSize}px
          </span>
        </div>
        <Slider
          value={[appearance.fontSize]}
          onValueChange={(value) => setAppearance({ ...appearance, fontSize: value[0] })}
          min={10}
          max={24}
          step={1}
          className="max-w-xs"
        />
      </div>

      {/* Code Preview */}
      <div className="space-y-3">
        <h3 className="font-semibold">Preview</h3>
        <div
          className="rounded-lg border border-border bg-[#0d1117] p-4 max-w-lg overflow-x-auto"
          style={{ fontSize: `${appearance.fontSize}px` }}
        >
          <pre className="font-mono text-[#c9d1d9]">
            {appearance.lineNumbers && <span className="text-[#484f58] mr-4 select-none">1</span>}
            <span className="text-[#ff7b72]">function</span> <span className="text-[#d2a8ff]">greet</span>
            <span className="text-[#c9d1d9]">(</span>
            <span className="text-[#ffa657]">name</span>
            <span className="text-[#c9d1d9]">)</span>
            <span className="text-[#c9d1d9]">{" {"}</span>
            {"\n"}
            {appearance.lineNumbers && <span className="text-[#484f58] mr-4 select-none">2</span>}
            {"  "}
            <span className="text-[#ff7b72]">return</span> <span className="text-[#a5d6ff]">{"`Hello, ${name}!`"}</span>
            <span className="text-[#c9d1d9]">;</span>
            {"\n"}
            {appearance.lineNumbers && <span className="text-[#484f58] mr-4 select-none">3</span>}
            <span className="text-[#c9d1d9]">{"}"}</span>
          </pre>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Line Numbers</h3>
            <p className="text-sm text-muted-foreground">Show line numbers in code blocks</p>
          </div>
          <Switch
            checked={appearance.lineNumbers}
            onCheckedChange={(checked) => setAppearance({ ...appearance, lineNumbers: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Word Wrap</h3>
            <p className="text-sm text-muted-foreground">Wrap long lines in code blocks</p>
          </div>
          <Switch
            checked={appearance.wordWrap}
            onCheckedChange={(checked) => setAppearance({ ...appearance, wordWrap: checked })}
          />
        </div>
      </div>

      <Button className="gap-2" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  )
}
