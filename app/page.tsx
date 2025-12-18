"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Code, TrendingUp, Bookmark, Hash, Users, FileCode, Star, Share2, Search, ChevronRight, Sparkles, Cpu, Rocket, ArrowRight, Zap, Lock, Wand2, Menu, Globe } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"

// Subtle gradient mesh background
function GradientMesh() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-slate-500/8 rounded-full blur-[150px] animate-blob" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-slate-400/8 rounded-full blur-[150px] animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-zinc-500/8 rounded-full blur-[150px] animate-blob animation-delay-4000" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:80px_80px]" />
    </div>
  )
}

// 3D Tilt card
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    cardRef.current.style.transform = `perspective(1000px) rotateX(${y / -50}deg) rotateY(${x / 50}deg) scale3d(1.01, 1.01, 1.01)`
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  }

  return (
    <div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={cn("transition-transform duration-300 ease-out", className)}>
      {children}
    </div>
  )
}

// Animated counter
function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const numValue = parseInt(value.replace(/\D/g, ''))

  useEffect(() => {
    const duration = 2000, steps = 60, increment = numValue / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= numValue) { setCount(numValue); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [numValue])

  return <span>{count.toLocaleString()}{suffix}</span>
}

export default function LandingPage() {
  const { t, language, setLanguage } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => setActiveFeature(prev => (prev + 1) % 6), 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    { icon: Code, title: t.landing.features.syntaxHighlighting, description: t.landing.features.syntaxHighlightingDesc },
    { icon: TrendingUp, title: t.landing.features.trendingSnippets, description: t.landing.features.trendingSnippetsDesc },
    { icon: Hash, title: t.landing.features.smartTags, description: t.landing.features.smartTagsDesc },
    { icon: Bookmark, title: t.landing.features.bookmarks, description: t.landing.features.bookmarksDesc },
    { icon: Share2, title: t.landing.features.easySharing, description: t.landing.features.easySharingDesc },
    { icon: Search, title: t.landing.features.powerfulSearch, description: t.landing.features.powerfulSearchDesc },
  ]

  const stats = [
    { value: "50000", suffix: "+", label: t.landing.stats.developers, icon: Users },
    { value: "120000", suffix: "+", label: t.landing.stats.snippets, icon: FileCode },
    { value: "45", suffix: "+", label: t.landing.stats.languages, icon: Cpu },
    { value: "1000000", suffix: "+", label: t.landing.stats.linesShared, icon: Code },
  ]

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
      <GradientMesh />

      {/* Premium Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-6 pt-4">
          <nav className="flex h-16 items-center justify-between rounded-2xl border border-white/[0.06] bg-[#09090b]/80 backdrop-blur-2xl px-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Image
                  src="/gitforum-logo.png"
                  alt="GitForum"
                  width={36}
                  height={36}
                  className="h-9 w-9 transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-lg font-semibold text-white/90 hidden sm:block">GitForum</span>
            </Link>

            {/* Center nav links */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/feed" className="px-4 py-2 text-sm text-white/50 hover:text-white/90 transition-colors rounded-lg hover:bg-white/[0.04]">
                {t.nav.home}
              </Link>
              <Link href="/explore" className="px-4 py-2 text-sm text-white/50 hover:text-white/90 transition-colors rounded-lg hover:bg-white/[0.04]">
                {t.nav.explore}
              </Link>
              <Link href="/trending" className="px-4 py-2 text-sm text-white/50 hover:text-white/90 transition-colors rounded-lg hover:bg-white/[0.04]">
                {t.nav.trending}
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'ru' ? 'kk' : 'ru')}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/50 hover:text-white/90 transition-colors rounded-lg hover:bg-white/[0.04]"
              >
                <Globe className="h-4 w-4" strokeWidth={1.5} />
                <span className="uppercase text-xs font-medium">{language}</span>
              </button>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/[0.04] transition-all">
                  {t.nav.login}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-white text-black hover:bg-white/90 font-medium rounded-xl transition-all hover:scale-[1.02]">
                  {t.nav.register}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20">
        <div className="relative mx-auto max-w-7xl px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left content */}
            <div className={cn("space-y-8", mounted ? "animate-fade-in-left" : "opacity-0")}>
              {/* Badge */}
              <div className="inline-flex items-center gap-3 rounded-full bg-white/[0.03] border border-white/[0.06] px-4 py-2">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                  <span className="text-xs text-emerald-500/90 font-medium">Live</span>
                </span>
                <span className="w-px h-3.5 bg-white/10" />
                <span className="text-xs text-white/50">{t.landing.tagline}</span>
              </div>

              {/* Main heading */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                  <span className="text-white">{t.landing.heroTitle}</span>
                  <br />
                  <span className="text-white/30">{t.landing.heroTitleHighlight}</span>
                </h1>

                <p className="text-lg text-white/40 max-w-md leading-relaxed">
                  {t.landing.heroDescription}
                </p>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-black hover:bg-white/90 px-6 py-6 text-base font-medium rounded-xl group transition-all hover:scale-[1.02]">
                    <Rocket className="h-4 w-4 mr-2 transition-transform group-hover:-translate-y-0.5" />
                    {t.landing.getStarted}
                  </Button>
                </Link>
                <Link href="/feed">
                  <Button size="lg" variant="outline" className="border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white/60 hover:text-white/90 px-6 py-6 text-base rounded-xl transition-all">
                    {t.nav.explore}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-white/[0.08] border-2 border-[#09090b] flex items-center justify-center text-[10px] font-medium text-white/50">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-white/20" strokeWidth={1.5} />
                  ))}
                  <span className="text-xs text-white/30 ml-1">10+ {t.badges.programmingLanguages}</span>
                </div>
              </div>
            </div>

            {/* Right side - Code window */}
            <div className={cn("relative", mounted ? "animate-fade-in-right" : "opacity-0")}>
              <TiltCard>
                <div className="absolute -inset-4 bg-white/[0.015] rounded-3xl blur-2xl" />

                <div className="relative rounded-2xl border border-white/[0.06] bg-[#0f0f11] overflow-hidden">
                  {/* Window header */}
                  <div className="flex items-center justify-between px-5 py-3 bg-white/[0.02] border-b border-white/[0.04]">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
                      <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
                      <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03]">
                      <FileCode className="h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
                      <span className="text-xs text-white/40 font-mono">useAuth.tsx</span>
                    </div>
                    <div className="w-14" />
                  </div>

                  {/* Code content */}
                  <div className="p-6 font-mono text-sm leading-relaxed">
                    <div className="space-y-1">
                      {[
                        { num: 1, content: <><span className="text-white/35">import</span><span className="text-white/55"> {"{ useState }"}</span><span className="text-white/35"> from</span><span className="text-white/45"> &apos;react&apos;</span></> },
                        { num: 2, content: null },
                        { num: 3, content: <><span className="text-white/35">export function</span><span className="text-white/65"> useAuth</span><span className="text-white/35">() {"{"}</span></> },
                        { num: 4, content: <><span className="text-white/25">  const</span><span className="text-white/55"> [user, setUser]</span><span className="text-white/35"> = useState(null)</span></> },
                        { num: 5, content: null },
                        { num: 6, content: <><span className="text-white/25">  return</span><span className="text-white/45"> {"{ user, setUser }"}</span></> },
                        { num: 7, content: <span className="text-white/35">{"}"}</span> },
                      ].map((line) => (
                        <div key={line.num} className="flex">
                          <span className="w-7 text-white/15 select-none text-right mr-4">{line.num}</span>
                          <span>{line.content}</span>
                        </div>
                      ))}
                      <div className="flex mt-2">
                        <span className="w-7 text-white/15 select-none text-right mr-4">8</span>
                        <span className="h-4 w-0.5 bg-white/40 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div className="flex items-center justify-between px-5 py-2.5 bg-white/[0.02] border-t border-white/[0.04] text-[10px] text-white/25">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                      TypeScript React
                    </span>
                    <span>UTF-8</span>
                  </div>
                </div>
              </TiltCard>

              {/* Floating badges with outline icons */}
              <div className="absolute -top-3 -left-3 animate-float">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f0f11] border border-white/[0.08] text-white/50 text-xs font-medium backdrop-blur-xl">
                  <Zap className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {t.badges.fast}
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 animate-float animation-delay-1000">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f0f11] border border-white/[0.08] text-white/50 text-xs font-medium backdrop-blur-xl">
                  <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {t.badges.secure}
                </div>
              </div>
              <div className="absolute top-1/2 -right-5 animate-float animation-delay-2000">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f0f11] border border-white/[0.08] text-white/50 text-xs font-medium backdrop-blur-xl">
                  <Wand2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {t.badges.modern}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-28 border-t border-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.03] border border-white/[0.06] px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-white/35" strokeWidth={1.5} />
              <span className="text-xs text-white/45">{t.common.features}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white/90">
              {t.landing.features.title}
            </h2>
            <p className="text-base text-white/35 max-w-xl mx-auto">
              {t.landing.features.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <TiltCard key={feature.title}>
                <div
                  className={cn(
                    "relative p-6 rounded-xl border border-white/[0.04] bg-white/[0.015] transition-all duration-300 group cursor-pointer h-full hover:border-white/[0.08] hover:bg-white/[0.025]",
                    activeFeature === index && "border-white/[0.08] bg-white/[0.025]"
                  )}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="h-11 w-11 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105">
                    <feature.icon className="h-5 w-5 text-white/40 group-hover:text-white/60 transition-colors" strokeWidth={1.5} />
                  </div>

                  <h3 className="text-base font-medium text-white/75 mb-2 group-hover:text-white/90 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/35 leading-relaxed group-hover:text-white/45 transition-colors">
                    {feature.description}
                  </p>

                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0">
                    <ArrowRight className="h-4 w-4 text-white/30" strokeWidth={1.5} />
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Code Snippets Showcase - Animated Marquee */}
      <section className="relative py-16 border-t border-white/[0.03] overflow-hidden">
        {/* Marquee container */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-[#09090b] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-[#09090b] to-transparent z-10" />

          {/* First row - scrolling left */}
          <div className="flex gap-3 animate-marquee mb-3">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-3 shrink-0">
                {[
                  'npm install @gitforum/cli',
                  'const user = await auth.login()',
                  'git push origin main',
                  'SELECT * FROM snippets',
                  'docker-compose up -d',
                  'fetch("/api/posts")',
                  'export default App',
                  'yarn add typescript',
                ].map((code, i) => (
                  <div
                    key={`${setIndex}-${i}`}
                    className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.1] cursor-default"
                  >
                    <code className="text-xs font-mono text-white/50">{code}</code>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Second row - scrolling right */}
          <div className="flex gap-3 animate-marquee-reverse mb-3">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-3 shrink-0">
                {[
                  'python manage.py runserver',
                  'const [state, setState] = useState()',
                  'CREATE TABLE users',
                  'kubectl apply -f deploy.yaml',
                  'import React from "react"',
                  'curl -X POST /api/auth',
                  'npx create-next-app',
                  'chmod +x script.sh',
                ].map((code, i) => (
                  <div
                    key={`${setIndex}-${i}`}
                    className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.1] cursor-default"
                  >
                    <code className="text-xs font-mono text-white/50">{code}</code>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Third row - scrolling left slower */}
          <div className="flex gap-3 animate-marquee" style={{ animationDuration: '35s' }}>
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-3 shrink-0">
                {[
                  'async function getData()',
                  'redis-cli SET key value',
                  'npm run build && npm start',
                  'interface User { id: string }',
                  'grep -r "pattern" .',
                  'prisma db push',
                  'brew install node',
                  'useEffect(() => {}, [])',
                ].map((code, i) => (
                  <div
                    key={`${setIndex}-${i}`}
                    className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.1] cursor-default"
                  >
                    <code className="text-xs font-mono text-white/50">{code}</code>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-28 border-t border-white/[0.03]">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="relative inline-block mb-8">
            <div className="h-20 w-20 mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <Rocket className="h-8 w-8 text-white/40" strokeWidth={1.5} />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white/90">
            {t.landing.cta.readyToShare}
          </h2>
          <p className="text-base text-white/35 max-w-md mx-auto mb-10">
            {t.landing.cta.signUpToday}
          </p>

          <Link href="/register">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 px-8 py-6 text-base font-medium rounded-xl group transition-all hover:scale-[1.02]">
              {t.landing.cta.createAccount}
              <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image src="/gitforum-logo.png" alt="GitForum" width={32} height={32} className="h-8 w-8" />
              <span className="font-medium text-white/70">GitForum</span>
            </div>
            <div className="flex items-center gap-8 text-xs text-white/25">
              {[t.landing.footer.about, t.landing.footer.privacy, t.landing.footer.terms, t.landing.footer.contact].map(item => (
                <Link key={item} href="#" className="hover:text-white/50 transition-colors">{item}</Link>
              ))}
            </div>
            <p className="text-xs text-white/20">{t.landing.footer.copyright}</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(15px, -20px) scale(1.03); }
          66% { transform: translate(-15px, 15px) scale(0.97); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fade-in-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-blob { animation: blob 30s ease-in-out infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-fade-in-left { animation: fade-in-left 0.7s ease-out forwards; }
        .animate-fade-in-right { animation: fade-in-right 0.7s ease-out 0.1s forwards; opacity: 0; }
        .animate-marquee { animation: marquee 25s linear infinite; }
        .animate-marquee-reverse { animation: marquee-reverse 25s linear infinite; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}
