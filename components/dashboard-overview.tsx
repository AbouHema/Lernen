"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DailyWordCard } from "@/components/daily-word-card";
import { ProgressSummary } from "@/components/progress-summary";
import { useApp } from "@/components/providers";
import { cn } from "@/lib/utils";

export function DashboardOverview() {
  const { t, locale } = useApp();
  const isRtl = locale === "ar";

  return (
    <div className="space-y-8">
      <div className={cn("space-y-2", isRtl && "text-right")}> 
        <p className="text-sm text-slate-500">{t.dashboardTitle}</p>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className={cn(isRtl && "flex-row-reverse")}> 
          <TabsTrigger value="overview">{t.vocabulary}</TabsTrigger>
          <TabsTrigger value="sentences">{t.sentences}</TabsTrigger>
          <TabsTrigger value="exercises">{t.exercises}</TabsTrigger>
          <TabsTrigger value="progress">{t.progress}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <DailyWordCard />
            <ProgressSummary />
          </div>
          <Card className="card-surface">
            <CardContent className={cn("flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between", isRtl && "md:flex-row-reverse")}> 
              <div>
                <p className="text-lg font-semibold">Schnell starten</p>
                <p className="text-sm text-slate-500">Springe direkt zu den Lernmodulen.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="gap-2">
                  <Link href="/learn/vocabulary">
                    {t.vocabulary}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Tipps</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>So holst du mehr aus deinem Lernen heraus</DialogTitle>
                      <DialogDescription>
                        Nutze täglich das Wort des Tages, speichere Favoriten und überprüfe deinen Streak für bessere
                        Routine.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentences">
          <Card className="card-surface">
            <CardContent className="space-y-4 p-6">
              <p className="text-lg font-semibold">Sätze üben</p>
              <p className="text-sm text-slate-500">Trainiere komplette Sätze mit direkter Übersetzung.</p>
              <Button asChild>
                <Link href="/learn/sentences">Zu den Sätzen</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises">
          <Card className="card-surface">
            <CardContent className="space-y-4 p-6">
              <p className="text-lg font-semibold">Interaktive Übungen</p>
              <p className="text-sm text-slate-500">Flashcards, Multiple Choice und mehr.</p>
              <Button asChild>
                <Link href="/learn/exercises">Zu den Übungen</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card className="card-surface">
            <CardContent className="space-y-4 p-6">
              <p className="text-lg font-semibold">Fortschritt verfolgen</p>
              <p className="text-sm text-slate-500">Sieh dir deinen Streak und deine Quiz-Scores an.</p>
              <Button asChild>
                <Link href="/learn/progress">Zum Fortschritt</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
