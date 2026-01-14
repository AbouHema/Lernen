"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useApp } from "@/components/providers";
import { cn } from "@/lib/utils";

export function LandingHero() {
  const { t, locale } = useApp();
  const isRtl = locale === "ar";

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#EFF4FF,_transparent_60%)]" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 lg:flex-row lg:items-center lg:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={cn("max-w-xl space-y-6", isRtl && "text-right")}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Lernen</p>
          <h1 className="text-balance text-4xl font-semibold leading-tight text-slate-900 dark:text-slate-100 md:text-5xl">
            {t.heroTitle}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">{t.heroSubtitle}</p>
          <div className={cn("flex flex-wrap gap-4", isRtl && "flex-row-reverse")}> 
            <Button asChild size="lg" className="gap-2">
              <Link href="/learn">
                {t.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/learn/vocabulary">Vokabeln ansehen</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="flex-1"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: "Daily Word", value: "12 neue Wörter" },
              { title: "Streak", value: "7 Tage" },
              { title: "Quiz", value: "80% Score" },
              { title: "Favorites", value: "24 Wörter" }
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
              >
                <p className="text-xs uppercase tracking-wide text-slate-400">{item.title}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
