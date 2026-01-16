"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type FlashcardProps = {
  german: string;
  arabic: string;
  phonetic?: string;
  className?: string;
  showFlags?: boolean;
};

export function Flashcard({ german, arabic, phonetic, className, showFlags = true }: FlashcardProps) {
  return (
    <div className={cn("space-y-3 rounded-2xl border border-slate-100 bg-white p-8 text-center", className)}>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-slate-900">
          {showFlags && <span className="mr-2">🇩🇪</span>}
          {german}
        </p>
        {phonetic && <p className="text-xs text-slate-400">{phonetic}</p>}
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-semibold text-slate-900" dir="rtl">
          {showFlags && <span className="mr-2">🇦🇪</span>}
          {arabic}
        </p>
      </div>
    </div>
  );
}
