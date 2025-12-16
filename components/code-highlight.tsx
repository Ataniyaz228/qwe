"use client"

import { useEffect, useState, memo } from "react"
import { codeToHtml } from "shiki"
import { useCodeSettings } from "@/contexts/CodeSettingsContext"

interface CodeHighlightProps {
    code: string
    language: string
    theme?: string
    showLineNumbers?: boolean
}

// Map language aliases to Shiki language IDs
const languageMap: Record<string, string> = {
    javascript: "javascript",
    typescript: "typescript",
    python: "python",
    rust: "rust",
    go: "go",
    java: "java",
    csharp: "csharp",
    cpp: "cpp",
    c: "c",
    html: "html",
    css: "css",
    sql: "sql",
    shell: "bash",
    ruby: "ruby",
    php: "php",
    swift: "swift",
    kotlin: "kotlin",
    dart: "dart",
    yaml: "yaml",
    json: "json",
    markdown: "markdown",
    other: "text",
}

// Маппинг шрифтов
const fontFamilyMap: Record<string, string> = {
    "jetbrains-mono": "'JetBrains Mono', ui-monospace, monospace",
    "fira-code": "'Fira Code', ui-monospace, monospace",
    "source-code-pro": "'Source Code Pro', ui-monospace, monospace",
    "cascadia-code": "'Cascadia Code', ui-monospace, monospace",
    "consolas": "Consolas, ui-monospace, monospace",
}

function CodeHighlightInner({ code, language, theme: propTheme, showLineNumbers: propShowLines }: CodeHighlightProps) {
    const { settings } = useCodeSettings()
    const [html, setHtml] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)

    const theme = propTheme || settings.theme
    const showLineNumbers = propShowLines ?? settings.lineNumbers
    const fontSize = settings.fontSize
    const fontFamily = fontFamilyMap[settings.font] || fontFamilyMap["jetbrains-mono"]

    useEffect(() => {
        async function highlight() {
            setIsLoading(true)
            try {
                const lang = languageMap[language.toLowerCase()] || "text"
                const result = await codeToHtml(code, {
                    lang,
                    theme: theme as "github-dark",
                })
                setHtml(result)
            } catch (err) {
                console.error("Shiki error:", err)
                setHtml(`<pre><code>${escapeHtml(code)}</code></pre>`)
            } finally {
                setIsLoading(false)
            }
        }

        if (code) {
            highlight()
        }
    }, [code, language, theme])

    const codeStyle = {
        fontSize: `${fontSize}px`,
        fontFamily,
        lineHeight: String(settings.lineHeight),
    }

    // CSS классы для номеров строк с CSS counter
    const lineNumbersClass = showLineNumbers
        ? "show-line-numbers"
        : ""

    if (isLoading) {
        return (
            <div className="bg-[#0d1117] rounded-lg overflow-x-auto p-4" style={codeStyle}>
                <pre className="m-0"><code className="text-gray-400">{code}</code></pre>
            </div>
        )
    }

    return (
        <div
            className={`code-block bg-[#0d1117] rounded-lg overflow-x-auto ${lineNumbersClass}`}
            style={codeStyle}
        >
            <style jsx>{`
                .code-block :global(.line) {
                    display: block;
                }
                .code-block.show-line-numbers :global(code) {
                    counter-reset: line;
                }
                .code-block.show-line-numbers :global(.line)::before {
                    counter-increment: line;
                    content: counter(line);
                    display: inline-block;
                    width: 2.5rem;
                    margin-right: 1rem;
                    padding-right: 0.5rem;
                    text-align: right;
                    color: #484f58;
                    border-right: 1px solid rgba(255,255,255,0.1);
                    user-select: none;
                }
                .code-block:not(.show-line-numbers) :global(.line) {
                    padding-left: 0;
                }
                .code-block :global(pre) {
                    margin: 0;
                    padding: 1rem;
                    background: transparent !important;
                }
                .code-block :global(code) {
                    display: block;
                }
            `}</style>
            <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}

export const CodeHighlight = memo(CodeHighlightInner)
