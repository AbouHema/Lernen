"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flashcard } from "@/components/flashcard";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/components/providers";
import { cn } from "@/lib/utils";

export function LandingScreens() {
  const { locale } = useApp();
  const isRtl = locale === "ar";

  return (
    <section className="py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 lg:flex-row">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex-1"
        >
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className={cn(isRtl && "text-right")}>Lern-Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {["Daily Word", "Flashcards", "Mini-Quiz"].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800"
                >
                  <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}> 
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                  <Badge variant="primary">Live</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1"
        >
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className={cn(isRtl && "text-right")}>Vocabulary View</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { ar: "قهوة", de: "der Kaffee" },
                { ar: "شقة", de: "die Wohnung" },
                { ar: "موعد", de: "der Termin" }
              ].map((item) => (
                <div
                  key={item.de}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <Flashcard german={item.de} arabic={item.ar} className="p-3" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
