"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Save, Loader2, Globe, Code2, Type, Hash, Eye } from "lucide-react"
import { toast } from "sonner"
import { useCodeSettings, codeThemes, codeFonts } from "@/contexts/CodeSettingsContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { CodeHighlight } from "@/components/code-highlight"

// Языки интерфейса
const languages = [
  { value: "ru", label: "Русский" },
  { value: "kk", label: "Қазақша" },
]

const previewCode = `function greet(name: string) {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return { success: true, name };
}

// Вызов функции
const result = greet("World");
console.log(result);`

export function SettingsAppearance() {
  const [saving, setSaving] = useState(false)
  const { settings, updateSettings } = useCodeSettings()
  const { language, setLanguage } = useLanguage()

  const handleSave = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    setSaving(false)
    toast.success("Настройки сохранены!")
  }

  return (
    <div className="space-y-8">
      {/* Language Selection */}
      <div className="space-y-4 p-5 rounded-xl bg-card border border-border">
        <div>
          <h3 className="font-semibold mb-1 flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Язык интерфейса
          </h3>
          <p className="text-sm text-muted-foreground">Выберите предпочитаемый язык</p>
        </div>
        <div className="flex gap-3">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value as "ru" | "kk")}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 transition-all font-medium ${language === lang.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background hover:border-muted-foreground/50 hover:bg-muted/50"
                }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor Theme */}
      <div className="space-y-4 p-5 rounded-xl bg-card border border-border">
        <div>
          <h3 className="font-semibold mb-1 flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            Тема кода
          </h3>
          <p className="text-sm text-muted-foreground">Подсветка синтаксиса для блоков кода</p>
        </div>
        <Select
          value={settings.theme}
          onValueChange={(value) => updateSettings({ theme: value })}
        >
          <SelectTrigger className="w-full max-w-sm bg-background border-border">
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
      <div className="space-y-4 p-5 rounded-xl bg-card border border-border">
        <div>
          <h3 className="font-semibold mb-1 flex items-center gap-2">
            <Type className="h-4 w-4 text-primary" />
            Шрифт кода
          </h3>
          <p className="text-sm text-muted-foreground">Моноширинный шрифт для блоков кода</p>
        </div>
        <Select
          value={settings.font}
          onValueChange={(value) => updateSettings({ font: value })}
        >
          <SelectTrigger className="w-full max-w-sm bg-background border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {codeFonts.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value === "consolas" ? "Consolas" : font.label }}>
                  {font.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div className="space-y-4 p-5 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Размер шрифта</h3>
            <p className="text-sm text-muted-foreground">
              Размер текста в блоках кода
            </p>
          </div>
          <span className="font-mono text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
            {settings.fontSize}px
          </span>
        </div>
        <Slider
          value={[settings.fontSize]}
          onValueChange={([value]) => updateSettings({ fontSize: value })}
          min={10}
          max={24}
          step={1}
          className="max-w-md"
        />
        <div className="flex justify-between text-xs text-muted-foreground max-w-md">
          <span>Мелкий (10px)</span>
          <span>Крупный (24px)</span>
        </div>
      </div>

      {/* Line Height */}
      <div className="space-y-4 p-5 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Межстрочный интервал</h3>
            <p className="text-sm text-muted-foreground">
              Отступ между строками кода
            </p>
          </div>
          <span className="font-mono text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
            {settings.lineHeight}
          </span>
        </div>
        <Slider
          value={[settings.lineHeight * 10]}
          onValueChange={([value]) => updateSettings({ lineHeight: value / 10 })}
          min={10}
          max={20}
          step={1}
          className="max-w-md"
        />
        <div className="flex justify-between text-xs text-muted-foreground max-w-md">
          <span>Компактно (1.0)</span>
          <span>Просторно (2.0)</span>
        </div>
      </div>

      {/* Editor Settings */}
      <div className="space-y-4 p-5 rounded-xl bg-card border border-border">
        <div>
          <h3 className="font-semibold mb-1 flex items-center gap-2">
            <Hash className="h-4 w-4 text-primary" />
            Настройки редактора
          </h3>
          <p className="text-sm text-muted-foreground">Дополнительные опции отображения кода</p>
        </div>
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border/50">
            <div>
              <Label className="font-medium">Номера строк</Label>
              <p className="text-sm text-muted-foreground">Показывать номера строк слева</p>
            </div>
            <Switch
              checked={settings.lineNumbers}
              onCheckedChange={(checked) => updateSettings({ lineNumbers: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border/50">
            <div>
              <Label className="font-medium">Перенос строк</Label>
              <p className="text-sm text-muted-foreground">Автоматический перенос длинных строк</p>
            </div>
            <Switch
              checked={settings.wordWrap}
              onCheckedChange={(checked) => updateSettings({ wordWrap: checked })}
            />
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="space-y-4 p-5 rounded-xl bg-card border border-border">
        <div>
          <h3 className="font-semibold mb-1 flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Предпросмотр
          </h3>
          <p className="text-sm text-muted-foreground">Так будет выглядеть код с текущими настройками</p>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <CodeHighlight
            code={previewCode}
            language="typescript"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-start pt-2">
        <Button onClick={handleSave} disabled={saving} size="lg" className="min-w-[160px]">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Сохранить настройки
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
