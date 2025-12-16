"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, Send, Loader2, Sparkles, X, Minimize2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"

interface Message {
    role: "user" | "assistant"
    content: string
}

// Groq API - очень быстрый
const GROQ_API_KEY = "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"

export function AiAssistantWidget() {
    const { language } = useLanguage()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const systemPrompt = language === "ru"
        ? "Ты - помощник по программированию на GitForum. Отвечай кратко на русском языке. Максимум 2-3 предложения."
        : "Сен - GitForum программалау көмекшісі. Қазақша қысқа жауап бер. Ең көбі 2-3 сөйлем."

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: "user", content: userMessage }])
        setIsLoading(true)

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: "user", content: userMessage }
                    ],
                    max_tokens: 200,
                    temperature: 0.7
                })
            })

            const data = await response.json()
            console.log("Groq response:", data)

            if (data.choices && data.choices[0]?.message?.content) {
                const assistantMessage = data.choices[0].message.content
                setMessages(prev => [...prev, { role: "assistant", content: assistantMessage }])
            } else if (data.error) {
                console.error("API Error:", data.error)
                throw new Error(data.error.message || "API Error")
            } else {
                throw new Error("No response")
            }
        } catch (error) {
            console.error("AI Error:", error)
            setMessages(prev => [...prev, {
                role: "assistant",
                content: language === "ru"
                    ? "Ошибка API. Попробуйте позже."
                    : "API қатесі. Кейінірек көріңіз."
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const clearChat = () => {
        setMessages([])
    }

    const needsScroll = messages.length > 3

    return (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border bg-gradient-to-r from-primary/10 to-purple-500/10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">AI Ассистент</h3>
                        <p className="text-[10px] text-muted-foreground">Groq • Llama 3.1</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                    </Button>
                    {messages.length > 0 && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearChat}>
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div
                className={cn(
                    "p-3 space-y-3 transition-all",
                    isExpanded ? "h-80" : "h-40",
                    needsScroll ? "overflow-y-auto scrollbar-thin" : "overflow-hidden"
                )}
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Bot className="h-8 w-8 text-muted-foreground/50 mb-2" />
                        <p className="text-xs text-muted-foreground">
                            {language === "ru" ? "Задайте вопрос по коду" : "Код бойынша сұрақ қойыңыз"}
                        </p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div
                            key={i}
                            className={cn(
                                "text-xs p-2.5 rounded-lg max-w-[90%] leading-relaxed",
                                msg.role === "user"
                                    ? "ml-auto bg-primary text-primary-foreground"
                                    : "bg-secondary text-secondary-foreground"
                            )}
                        >
                            {msg.content}
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {language === "ru" ? "Думаю..." : "Ойланамын..."}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-2 border-t border-border">
                <div className="flex gap-1.5">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={language === "ru" ? "Спросите..." : "Сұраңыз..."}
                        className="h-8 text-xs bg-secondary border-0 focus-visible:ring-1"
                        disabled={isLoading}
                    />
                    <Button
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                    >
                        <Send className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
