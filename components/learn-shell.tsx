"use client";

import Link from "next/link";
import { BookOpen, Globe, LayoutGrid, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/components/providers";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/learn", label: "Dashboard", icon: LayoutGrid },
  { href: "/learn/vocabulary", label: "Vokabeln" },
  { href: "/learn/sentences", label: "Sätze" },
  { href: "/learn/exercises", label: "Übungen" },
  { href: "/learn/progress", label: "Fortschritt" }
];

export function LearnShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale, setLocale, theme, toggleTheme, t } = useApp();
  const isRtl = locale === "ar";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            Lernen
          </Link>
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
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-500">
              <span>{t.darkMode}</span>
              <Switch checked={theme === "dark"} onCheckedChange={() => toggleTheme()} />
            </div>
            <Badge variant="primary">Beta</Badge>
            <Button asChild variant="outline">
              <Link href="/">Zur Landing</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 lg:flex-row">
        <aside className="flex w-full flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 lg:w-64">
          <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}> 
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Lernen</p>
              <p className="text-xs text-slate-500">Arabisch → Deutsch</p>
            </div>
          </div>
          <nav className={cn("flex flex-col gap-1", isRtl && "text-right")}> 
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100",
                    active && "bg-primary/10 text-primary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
