"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface CodeSettings {
    theme: string
    font: string
    fontSize: number
    lineHeight: number
    lineNumbers: boolean
    wordWrap: boolean
}

interface CodeSettingsContextType {
    settings: CodeSettings
    updateSettings: (settings: Partial<CodeSettings>) => void
}

const defaultSettings: CodeSettings = {
    theme: "github-dark",
    font: "jetbrains-mono",
    fontSize: 14,
    lineHeight: 1.4,
    lineNumbers: true,
    wordWrap: false,
}

const CodeSettingsContext = createContext<CodeSettingsContextType | undefined>(undefined)

export function CodeSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<CodeSettings>(defaultSettings)
    const [isLoaded, setIsLoaded] = useState(false)

    // Загрузка настроек из localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("gitforum-code-settings")
            if (saved) {
                const parsed = JSON.parse(saved)
                setSettings({ ...defaultSettings, ...parsed })
            }
        } catch (e) {
            console.error("Error loading code settings:", e)
        }
        setIsLoaded(true)
    }, [])

    // Сохранение настроек в localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("gitforum-code-settings", JSON.stringify(settings))
        }
    }, [settings, isLoaded])

    // Применение CSS переменных
    useEffect(() => {
        if (isLoaded) {
            const root = document.documentElement
            root.style.setProperty("--code-font-size", `${settings.fontSize}px`)
            root.style.setProperty("--code-font-family", getFontFamily(settings.font))
        }
    }, [settings.fontSize, settings.font, isLoaded])

    const updateSettings = (newSettings: Partial<CodeSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }))
    }

    return (
        <CodeSettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </CodeSettingsContext.Provider>
    )
}

export function useCodeSettings() {
    const context = useContext(CodeSettingsContext)
    if (!context) {
        // Возвращаем дефолтные настройки если контекст недоступен
        return {
            settings: defaultSettings,
            updateSettings: () => { },
        }
    }
    return context
}

// Маппинг шрифтов
function getFontFamily(font: string): string {
    const fonts: Record<string, string> = {
        "jetbrains-mono": "'JetBrains Mono', monospace",
        "fira-code": "'Fira Code', monospace",
        "source-code-pro": "'Source Code Pro', monospace",
        "cascadia-code": "'Cascadia Code', monospace",
        "consolas": "Consolas, monospace",
    }
    return fonts[font] || "'JetBrains Mono', monospace"
}

// Экспорт тем для использования в других компонентах
export const codeThemes = [
    { value: "github-dark", label: "GitHub Dark" },
    { value: "dracula", label: "Dracula" },
    { value: "monokai", label: "Monokai" },
    { value: "nord", label: "Nord" },
    { value: "one-dark-pro", label: "One Dark Pro" },
    { value: "vitesse-dark", label: "Vitesse Dark" },
]

export const codeFonts = [
    { value: "jetbrains-mono", label: "JetBrains Mono" },
    { value: "fira-code", label: "Fira Code" },
    { value: "source-code-pro", label: "Source Code Pro" },
    { value: "cascadia-code", label: "Cascadia Code" },
    { value: "consolas", label: "Consolas" },
]
