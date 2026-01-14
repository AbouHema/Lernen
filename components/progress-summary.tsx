"use client";

import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/components/providers";
import { getLearned, getStreak } from "@/lib/storage";
import { vocabulary } from "@/data/vocabulary";
import { cn } from "@/lib/utils";

export function ProgressSummary() {
  const { t, locale } = useApp();
  const isRtl = locale === "ar";
  const [learnedCount, setLearnedCount] = React.useState(0);
  const [streak, setStreak] = React.useState(0);

  React.useEffect(() => {
    setLearnedCount(getLearned().length);
    setStreak(getStreak());
  }, []);

  const percentage = Math.min(100, Math.round((learnedCount / vocabulary.length) * 100));

  return (
    <Card className="card-surface">
      <CardContent className={cn("space-y-4 p-6", isRtl && "text-right")}> 
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{t.learnedWords}</p>
            <p className="text-2xl font-semibold">{learnedCount}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">{t.streak}</p>
            <p className="text-2xl font-semibold">{streak}</p>
          </div>
        </div>
        <Progress value={percentage} />
        <p className="text-xs text-slate-500">{percentage}% der Vokabeln gelernt</p>
      </CardContent>
    </Card>
  );
}
