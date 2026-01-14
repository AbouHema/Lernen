"use client";

import { motion } from "framer-motion";
import { BookOpen, Brain, Sparkle, Zap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/components/providers";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: BookOpen,
    title: "Smart Vocabulary",
    text: "60+ kuratierte Vokabeln mit Beispielen und Artikeln."
  },
  {
    icon: Brain,
    title: "Interaktive Übungen",
    text: "Flashcards, Lückentext und Mini-Quiz für schnelles Lernen."
  },
  {
    icon: Sparkle,
    title: "RTL & Deutsch",
    text: "Sprachumschalter mit perfekter RTL-Unterstützung."
  },
  {
    icon: Zap,
    title: "Progress Tracking",
    text: "Streaks, Verlauf und Favoriten lokal gespeichert."
  }
];

export function LandingFeatures() {
  const { t, locale } = useApp();
  const isRtl = locale === "ar";

  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className={cn("flex flex-col gap-4", isRtl && "text-right")}> 
          <h2 className="text-3xl font-semibold dark:text-slate-100">{t.featuresTitle}</h2>
          <p className="text-slate-600 dark:text-slate-300">{t.featuresSubtitle}</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="h-full card-surface">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">{feature.text}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
