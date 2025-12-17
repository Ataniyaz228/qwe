"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Code, TrendingUp, Bookmark, Hash, Users, FileCode, Star, Zap, Share2, Search } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function LandingPage() {
  const { t } = useLanguage()

  const features = [
    {
      icon: Code,
      title: t.landing.features.syntaxHighlighting,
      description: t.landing.features.syntaxHighlightingDesc,
    },
    {
      icon: TrendingUp,
      title: t.landing.features.trendingSnippets,
      description: t.landing.features.trendingSnippetsDesc,
    },
    {
      icon: Hash,
      title: t.landing.features.smartTags,
      description: t.landing.features.smartTagsDesc,
    },
    {
      icon: Bookmark,
      title: t.landing.features.bookmarks,
      description: t.landing.features.bookmarksDesc,
    },
    {
      icon: Share2,
      title: t.landing.features.easySharing,
      description: t.landing.features.easySharingDesc,
    },
    {
      icon: Search,
      title: t.landing.features.powerfulSearch,
      description: t.landing.features.powerfulSearchDesc,
    },
  ]

  const steps = [
    {
      number: "01",
      title: t.landing.howItWorks.step1,
      description: t.landing.howItWorks.step1Desc,
    },
    {
      number: "02",
      title: t.landing.howItWorks.step2,
      description: t.landing.howItWorks.step2Desc,
    },
    {
      number: "03",
      title: t.landing.howItWorks.step3,
      description: t.landing.howItWorks.step3Desc,
    },
  ]

  const stats = [
    { value: "50K+", label: t.landing.stats.developers },
    { value: "120K+", label: t.landing.stats.snippets },
    { value: "45+", label: t.landing.stats.languages },
    { value: "1M+", label: t.landing.stats.linesShared },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Image src="/gitforum-logo.png" alt="GitForum" width={32} height={32} className="h-8 w-8" />
            <span className="text-lg font-semibold tracking-tight">GitForum</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t.nav.login}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">{t.nav.register}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm mb-6">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-muted-foreground">{t.landing.tagline}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
            {t.landing.heroTitle}{" "}
            <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
              {t.landing.heroTitleHighlight}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
            {t.landing.heroDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <FileCode className="h-5 w-5" />
                {t.landing.getStarted}
              </Button>
            </Link>
          </div>

          {/* Code Preview */}
          <div className="mt-16 mx-auto max-w-3xl">
            <div className="rounded-lg border border-border bg-card overflow-hidden shadow-2xl shadow-primary/5">
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-sm text-muted-foreground font-mono ml-2">useDebounce.ts</span>
              </div>
              <div className="p-4 font-mono text-sm text-left overflow-x-auto">
                <div className="flex gap-4">
                  <div className="flex flex-col text-muted-foreground/50 select-none">
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <span key={n}>{n}</span>
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span>
                      <span className="text-blue-400">import</span> {"{"} <span className="text-sky-300">useState</span>
                      , <span className="text-sky-300">useEffect</span> {"}"}{" "}
                      <span className="text-blue-400">from</span>{" "}
                      <span className="text-green-400">&apos;react&apos;</span>;
                    </span>
                    <span>&nbsp;</span>
                    <span>
                      <span className="text-blue-400">export function</span>{" "}
                      <span className="text-yellow-300">useDebounce</span>
                      {"<"}
                      <span className="text-sky-300">T</span>
                      {">"} (value: <span className="text-sky-300">T</span>, delay:{" "}
                      <span className="text-sky-300">number</span>): <span className="text-sky-300">T</span> {"{"}
                    </span>
                    <span>
                      {"  "}
                      <span className="text-blue-400">const</span> [debounced, setDebounced] ={" "}
                      <span className="text-yellow-300">useState</span>(value);
                    </span>
                    <span>&nbsp;</span>
                    <span>
                      {"  "}
                      <span className="text-yellow-300">useEffect</span>(() {"=>"} {"{"} ... {"}"}, [value, delay]);
                    </span>
                    <span>{"}"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.landing.features.title}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.landing.features.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-border bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.landing.howItWorks.title}</h2>
            <p className="text-muted-foreground text-lg">{t.landing.howItWorks.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border" />
                )}
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <span className="text-xl font-bold text-primary">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-muted-foreground">{t.landing.cta.joinDevelopers}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{t.landing.cta.readyToShare}</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            {t.landing.cta.signUpToday}
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2">
              <Star className="h-5 w-5" />
              {t.landing.cta.createAccount}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/gitforum-logo.png" alt="GitForum" width={24} height={24} className="h-6 w-6" />
              <span className="font-semibold">GitForum</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                {t.landing.footer.about}
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                {t.landing.footer.privacy}
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                {t.landing.footer.terms}
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                {t.landing.footer.contact}
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">{t.landing.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
