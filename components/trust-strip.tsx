"use client";

import { Badge } from "@/components/ui/badge";
import { useApp } from "@/components/providers";
import { cn } from "@/lib/utils";

export function TrustStrip() {
  const { t, locale } = useApp();
  const isRtl = locale === "ar";

  return (
    <section className="py-10">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-6 py-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/80">
        <p className={cn("text-sm text-slate-600 dark:text-slate-300", isRtl && "text-right")}>{t.trust}</p>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Badge key={index} variant="outline">
              ★★★★★
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
