"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Save, Loader2, Globe, Code2, Type, Hash, Eye, Check } from "lucide-react"
import { toast } from "sonner"
import { useCodeSettings, codeThemes, codeFonts } from "@/contexts/CodeSettingsContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { CodeHighlight } from "@/components/code-highlight"
import { cn } from "@/lib/utils"

const languages = [
  { value: "ru", label: "Русский", flag: "🇷🇺" },
  { value: "kk", label: "Қазақша", flag: "🇰🇿" },
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
    <div className="space-y-6">
      {/* Language Selection */}
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-white/40" strokeWidth={1.5} />
          <div>
            <h3 className="text-sm font-medium text-white/70">Язык интерфейса</h3>
            <p className="text-[11px] text-white/30">Выберите предпочитаемый язык</p>
          </div>
        </div>
        <div className="flex gap-3">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value as "ru" | "kk")}
              className={cn(
                "flex items-center gap-3 px-5 py-3 rounded-xl border transition-all font-medium",
                language === lang.value
                  ? "border-white/[0.15] bg-white/[0.06] text-white/90"
                  : "border-white/[0.04] bg-white/[0.02] text-white/40 hover:border-white/[0.08] hover:text-white/60"
              )}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm">{lang.label}</span>
              {language === lang.value && (
                <Check className="h-4 w-4 text-green-400 ml-1" strokeWidth={2} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor Theme */}
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="h-4 w-4 text-white/40" strokeWidth={1.5} />
          <div>
            <h3 className="text-sm font-medium text-white/70">Тема кода</h3>
            <p className="text-[11px] text-white/30">Подсветка синтаксиса</p>
          </div>
        </div>
        <Select
          value={settings.theme}
          onValueChange={(value) => updateSettings({ theme: value })}
        >
          <SelectTrigger className="w-full max-w-sm h-10 bg-white/[0.03] border-white/[0.06] text-white/70 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0c0c0e] border-white/[0.06]">
            {codeThemes.map((theme) => (
              <SelectItem key={theme.value} value={theme.value}>
                {theme.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Code Font */}
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-2 mb-3">
          <Type className="h-4 w-4 text-white/40" strokeWidth={1.5} />
          <div>
            <h3 className="text-sm font-medium text-white/70">Шрифт кода</h3>
            <p className="text-[11px] text-white/30">Моноширинный шрифт</p>
          </div>
        </div>
        <Select
          value={settings.font}
          onValueChange={(value) => updateSettings({ font: value })}
        >
          <SelectTrigger className="w-full max-w-sm h-10 bg-white/[0.03] border-white/[0.06] text-white/70 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0c0c0e] border-white/[0.06]">
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
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-white/70">Размер шрифта</h3>
            <p className="text-[11px] text-white/30">Размер текста в коде</p>
          </div>
          <span className="font-mono text-sm font-bold text-white/80 bg-white/[0.06] px-3 py-1 rounded-lg">
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
        <div className="flex justify-between text-[10px] text-white/25 max-w-md">
          <span>10px</span>
          <span>24px</span>
        </div>
      </div>

      {/* Line Height */}
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-white/70">Межстрочный интервал</h3>
            <p className="text-[11px] text-white/30">Отступ между строками</p>
          </div>
          <span className="font-mono text-sm font-bold text-white/80 bg-white/[0.06] px-3 py-1 rounded-lg">
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
        <div className="flex justify-between text-[10px] text-white/25 max-w-md">
          <span>Компактно (1.0)</span>
          <span>Просторно (2.0)</span>
        </div>
      </div>

      {/* Editor Settings */}
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="h-4 w-4 text-white/40" strokeWidth={1.5} />
          <div>
            <h3 className="text-sm font-medium text-white/70">Настройки редактора</h3>
            <p className="text-[11px] text-white/30">Дополнительные опции</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div>
              <Label className="text-sm text-white/60">Номера строк</Label>
              <p className="text-[11px] text-white/30">Слева от кода</p>
            </div>
            <Switch
              checked={settings.lineNumbers}
              onCheckedChange={(checked) => updateSettings({ lineNumbers: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div>
              <Label className="text-sm text-white/60">Перенос строк</Label>
              <p className="text-[11px] text-white/30">Автоматический перенос</p>
            </div>
            <Switch
              checked={settings.wordWrap}
              onCheckedChange={(checked) => updateSettings({ wordWrap: checked })}
            />
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-4 w-4 text-white/40" strokeWidth={1.5} />
          <div>
            <h3 className="text-sm font-medium text-white/70">Предпросмотр</h3>
            <p className="text-[11px] text-white/30">Как будет выглядеть код</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.04] overflow-hidden">
          <CodeHighlight
            code={previewCode}
            language="typescript"
          />
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="gap-2 bg-white text-black hover:bg-white/90 rounded-xl h-10 font-medium min-w-[180px]"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Сохранение...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" strokeWidth={2} />
            Сохранить настройки
          </>
        )}
      </Button>
    </div>
  )
}
