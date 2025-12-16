"use client"

import { useLanguage, type Language } from "@/contexts/LanguageContext"
import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"

// Иконка флага России
function RuFlag({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <rect fill="#CE2028" y="24" width="36" height="12" />
            <rect fill="#22408C" y="12" width="36" height="12" />
            <rect fill="#EEEEEE" width="36" height="12" />
        </svg>
    )
}

// Иконка флага Казахстана
function KzFlag({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <rect fill="#00ABC2" width="36" height="36" />
            <circle fill="#FFCE00" cx="18" cy="18" r="6" />
            <path fill="#FFCE00" d="M18 6l1.5 4.5L24 12l-4.5 1.5L18 18l-1.5-4.5L12 12l4.5-1.5z" />
        </svg>
    )
}

const languages: { value: Language; label: string; Flag: React.FC<{ className?: string }> }[] = [
    { value: "ru", label: "Русский", Flag: RuFlag },
    { value: "kk", label: "Қазақша", Flag: KzFlag },
]

interface LanguageSelectorProps {
    variant?: "compact" | "full"
    className?: string
}

export function LanguageSelector({ variant = "compact", className }: LanguageSelectorProps) {
    const { language, setLanguage } = useLanguage()

    if (variant === "full") {
        return (
            <div className={cn("flex gap-2", className)}>
                {languages.map((lang) => (
                    <button
                        key={lang.value}
                        onClick={() => setLanguage(lang.value)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-colors",
                            language === lang.value
                                ? "border-primary bg-primary/10"
                                : "border-border bg-card hover:border-muted-foreground/50"
                        )}
                    >
                        <lang.Flag className="w-5 h-4 rounded-sm" />
                        <span className="font-medium">{lang.label}</span>
                    </button>
                ))}
            </div>
        )
    }

    // Compact dropdown-like
    const CurrentFlag = languages.find(l => l.value === language)?.Flag || RuFlag

    return (
        <div className={cn("relative group", className)}>
            <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <Globe className="h-4 w-4" />
                <CurrentFlag className="w-4 h-3 rounded-sm" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50">
                <div className="bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px]">
                    {languages.map((lang) => (
                        <button
                            key={lang.value}
                            onClick={() => setLanguage(lang.value)}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors",
                                language === lang.value && "bg-primary/10 text-primary"
                            )}
                        >
                            <lang.Flag className="w-5 h-4 rounded-sm" />
                            <span>{lang.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
