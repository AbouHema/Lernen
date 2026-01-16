"use client";

import { vocabulary } from "@/data/vocabulary";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flashcard } from "@/components/flashcard";
import { useApp } from "@/components/providers";
import { cn } from "@/lib/utils";

export function DailyWordCard() {
  const { t, locale } = useApp();
  const isRtl = locale === "ar";
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const word = vocabulary[dayIndex % vocabulary.length];

  return (
    <Card className="card-surface">
      <CardContent className={cn("space-y-3 p-6", isRtl && "text-right")}> 
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-500">{t.dailyWord}</p>
          <Badge variant="primary">{word.level}</Badge>
        </div>
        <Flashcard german={`${word.article} ${word.german}`} arabic={word.arabic} className="p-4" />
        <p className="text-sm text-slate-500">{word.category}</p>
        <p className="text-sm text-slate-500">{word.example_de}</p>
      </CardContent>
    </Card>
  );
}
