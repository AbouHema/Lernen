"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ProgressSummary } from "@/components/progress-summary";
import { ProgressChart } from "@/components/progress-chart";
import { useApp } from "@/components/providers";
import { cn } from "@/lib/utils";

export function ProgressPage() {
  const { locale } = useApp();
  const isRtl = locale === "ar";

  return (
    <div className="space-y-6">
      <div className={cn("space-y-2", isRtl && "text-right")}> 
        <h1 className="text-3xl font-semibold">Fortschritt</h1>
        <p className="text-sm text-slate-500">Behalte deinen Lernfortschritt im Blick.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressSummary />
        <ProgressChart />
      </div>
      <Card className="card-surface">
        <CardContent className="p-6 text-sm text-slate-500">
          Deine Fortschritte werden lokal im Browser gespeichert. Synchronisierung folgt später.
        </CardContent>
      </Card>
    </div>
  );
}
