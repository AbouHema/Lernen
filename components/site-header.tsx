"use client";

import Link from "next/link";
import { Globe, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/components/providers";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { locale, setLocale, theme, toggleTheme, t } = useApp();
  const isRtl = locale === "ar";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>Lernen</span>
        </Link>

        <nav className={cn("hidden items-center gap-6 text-sm text-slate-600 md:flex", isRtl && "flex-row-reverse")}> 
          <Link href="/learn">Dashboard</Link>
          <Link href="/learn/vocabulary">{t.vocabulary}</Link>
          <Link href="/learn/exercises">{t.exercises}</Link>
          <Link href="/learn/progress">{t.progress}</Link>
        </nav>

        <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}> 
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Globe className="h-4 w-4" />
                {t.language}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRtl ? "start" : "end"}>
              <DropdownMenuItem onClick={() => setLocale("de")}>Deutsch</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale("ar")}>العربية</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-300">
            <span>{t.darkMode}</span>
            <Switch checked={theme === "dark"} onCheckedChange={() => toggleTheme()} />
          </div>

          <Button asChild className="hidden md:inline-flex">
            <Link href="/learn">{t.cta}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
