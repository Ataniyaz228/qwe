"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, Sparkles, X, Loader2, MessageSquare, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { getCodeReview } from "@/lib/n8n"
import { cn } from "@/lib/utils"

interface CodeReviewWidgetProps {
    code: string
    language: string
    title?: string
}

export function CodeReviewWidget({ code, language, title }: CodeReviewWidgetProps) {
    const { t } = useLanguage()
    const [review, setReview] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [hasReviewed, setHasReviewed] = useState(false)
    const reviewRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isExpanded && reviewRef.current) {
            reviewRef.current.scrollTop = reviewRef.current.scrollHeight
        }
    }, [review, isExpanded])

    const handleStartReview = async () => {
        if (!code.trim()) {
            setReview(t.n8n.noCode)
            return
        }

        setIsLoading(true)
        setIsExpanded(true)
        setReview("")

        try {
            const response = await getCodeReview({
                code,
                language,
                title,
            })

            if (response.success && response.review) {
                setReview(response.review)
                setHasReviewed(true)
            } else {
                setReview(response.error || t.n8n.reviewError)
            }
        } catch (err) {
            console.error("Code review error:", err)
            setReview(t.n8n.reviewError)
        } finally {
            setIsLoading(false)
        }
    }

    const clearReview = () => {
        setReview("")
        setHasReviewed(false)
        setIsExpanded(false)
    }

    return (
        <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/[0.06] flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-purple-400/80" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="font-medium text-sm text-white/80">{t.n8n.codeReview}</h3>
                        <p className="text-[10px] text-white/30">{t.n8n.codeReviewDesc}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {hasReviewed && !isLoading && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                            onClick={(e) => {
                                e.stopPropagation()
                                clearReview()
                            }}
                        >
                            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </Button>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-white/30" strokeWidth={1.5} />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-white/30" strokeWidth={1.5} />
                    )}
                </div>
            </div>

            {/* Content */}
            <div className={cn(
                "overflow-hidden transition-all duration-300",
                isExpanded ? "max-h-[400px]" : "max-h-0"
            )}>
                <div className="border-t border-white/[0.04]">
                    {/* Review content */}
                    <div
                        ref={reviewRef}
                        className={cn(
                            "p-4 space-y-3 transition-all",
                            review ? "min-h-[150px] max-h-[280px] overflow-y-auto scrollbar-thin" : ""
                        )}
                    >
                        {!review && !isLoading ? (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="h-12 w-12 rounded-xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center mb-3">
                                    <Bot className="h-5 w-5 text-white/30" strokeWidth={1.5} />
                                </div>
                                <p className="text-xs text-white/30 mb-4">
                                    {t.n8n.codeReviewDesc}
                                </p>
                                <Button
                                    onClick={handleStartReview}
                                    disabled={!code.trim()}
                                    className="gap-2 bg-white/[0.06] hover:bg-white/[0.1] text-white/70 border border-white/[0.06] rounded-xl text-xs h-9"
                                >
                                    <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                                    {t.n8n.startReview}
                                </Button>
                            </div>
                        ) : isLoading ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-white/40 mb-3" />
                                <p className="text-xs text-white/40">{t.n8n.reviewing}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] text-white/40">
                                    <Sparkles className="h-3 w-3" strokeWidth={1.5} />
                                    {t.n8n.reviewComplete}
                                </div>
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                    <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
                                        {review}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleStartReview}
                                    className="gap-1.5 text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.04] rounded-lg h-8"
                                >
                                    <MessageSquare className="h-3 w-3" strokeWidth={1.5} />
                                    {t.n8n.startReview}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
