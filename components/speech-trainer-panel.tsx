"use client";

import * as React from "react";

import { useSpeechTrainer } from "@/lib/use-speech-trainer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Flashcard } from "@/components/flashcard";
import { useApp } from "@/components/providers";
import { cn } from "@/lib/utils";

type SpeechTrainerPanelProps<Item> = {
  items: Item[];
  getExpectedText: (item: Item) => string;
  getGermanText: (item: Item) => string;
  getArabicText: (item: Item) => string;
  getMetaText?: (item: Item) => string;
  enableSimilarity?: boolean;
  title: string;
};

const speakText = (text: string, lang = "de-DE") => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

export function SpeechTrainerPanel<Item>({
  items,
  getExpectedText,
  getGermanText,
  getArabicText,
  getMetaText,
  enableSimilarity = false,
  title
}: SpeechTrainerPanelProps<Item>) {
  const { t, locale } = useApp();
  const isRtl = locale === "ar";
  const [index, setIndex] = React.useState(0);
  const [strictMode, setStrictMode] = React.useState(true);
  const [ttsEnabled, setTtsEnabled] = React.useState(false);
  const [autoListening, setAutoListening] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    tone: "neutral" | "success" | "warning" | "error";
    message: string;
    solution?: string;
  } | null>(null);
  const lastHandledTranscriptRef = React.useRef<string>("");

  const { state, startListening, stopListening } = useSpeechTrainer({
    strictMode,
    ignoreArticles: !strictMode,
    enableSimilarity,
    similarityThreshold: 0.9,
    nearThreshold: 0.8
  });

  const itemsRef = React.useRef(items);
  const indexRef = React.useRef(index);
  const autoListeningRef = React.useRef(autoListening);
  const ttsEnabledRef = React.useRef(ttsEnabled);
  const getExpectedTextRef = React.useRef(getExpectedText);

  React.useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  React.useEffect(() => {
    indexRef.current = index;
  }, [index]);

  React.useEffect(() => {
    autoListeningRef.current = autoListening;
  }, [autoListening]);

  React.useEffect(() => {
    ttsEnabledRef.current = ttsEnabled;
  }, [ttsEnabled]);

  React.useEffect(() => {
    getExpectedTextRef.current = getExpectedText;
  }, [getExpectedText]);

  const startCurrent = React.useCallback(() => {
    const currentItems = itemsRef.current;
    if (currentItems.length === 0) return;
    const currentItem = currentItems[indexRef.current % currentItems.length];
    const expected = getExpectedTextRef.current(currentItem);
    startListening(expected, () => undefined, () => undefined);
  }, [startListening]);

  React.useEffect(() => {
    if (!state.transcript || state.transcript === lastHandledTranscriptRef.current) return;
    lastHandledTranscriptRef.current = state.transcript;
    if (state.lastResult === "correct") {
      setFeedback({ tone: "success", message: t.speechCorrect });
      if (ttsEnabledRef.current) {
        speakText(t.speechCorrect, "de-DE");
      }
      setIndex((prev) => (prev + 1) % itemsRef.current.length);
      return;
    }
    if (state.lastResult === "almost" || state.lastResult === "incorrect") {
      const item = itemsRef.current[indexRef.current % itemsRef.current.length];
      const expectedText = getExpectedTextRef.current(item);
      const isAlmost = state.lastResult === "almost";
      setFeedback({
        tone: isAlmost ? "warning" : "error",
        message: isAlmost ? t.speechAlmost : t.speechIncorrect,
        solution: expectedText
      });
      if (ttsEnabledRef.current) {
        speakText(expectedText, "de-DE");
      }
    }
  }, [state.lastResult, state.transcript, t.speechAlmost, t.speechCorrect, t.speechIncorrect]);

  React.useEffect(() => {
    if (!autoListeningRef.current) return;
    if (!feedback) return;
    if (feedback.tone === "success") {
      startCurrent();
      return;
    }
    if (feedback.tone === "warning" || feedback.tone === "error") {
      startCurrent();
    }
  }, [feedback, startCurrent]);

  React.useEffect(() => stopListening, [stopListening]);

  const hasItems = items.length > 0;
  const currentItem = hasItems ? items[index % items.length] : null;
  const germanText = currentItem ? getGermanText(currentItem) : "";
  const arabicText = currentItem ? getArabicText(currentItem) : "";
  const metaText = currentItem && getMetaText ? getMetaText(currentItem) : null;

  return (
    <div className="space-y-4">
      <div className={cn("flex flex-wrap items-center justify-between gap-3", isRtl && "flex-row-reverse")}>
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            <Badge variant="outline">
              {t.question} {items.length > 0 ? index + 1 : 0}/{items.length}
            </Badge>
            {metaText && <span>{metaText}</span>}
          </div>
        </div>
        <div className={cn("flex items-center gap-3 text-xs text-slate-500", isRtl && "flex-row-reverse")}>
          <div className="flex items-center gap-2">
            <span>{t.strictMode}</span>
            <Switch checked={strictMode} onCheckedChange={setStrictMode} />
          </div>
          <div className="flex items-center gap-2">
            <span>{t.tts}</span>
            <Switch checked={ttsEnabled} onCheckedChange={setTtsEnabled} />
          </div>
        </div>
      </div>

      <Flashcard german={germanText} arabic={arabicText} />

      <div className={cn("flex flex-wrap gap-3", isRtl && "flex-row-reverse")}>
        <Button
          onClick={() => {
            setAutoListening(true);
            setFeedback(null);
            startCurrent();
          }}
          disabled={!hasItems || state.lastResult === "unsupported"}
        >
          {state.isListening ? t.listening : t.startListening}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setAutoListening(false);
            stopListening();
          }}
        >
          {t.stopListening}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            if (!hasItems) return;
            setAutoListening(false);
            stopListening();
            setFeedback(null);
            setIndex((prev) => (prev + 1) % items.length);
          }}
          disabled={!hasItems}
        >
          {t.next}
        </Button>
      </div>

      {state.lastResult === "unsupported" && (
        <p className="text-sm text-slate-500">{t.pronunciationUnsupported}</p>
      )}

      {feedback && (
        <p
          className={cn(
            "text-sm",
            feedback.tone === "success" && "text-emerald-600",
            feedback.tone === "warning" && "text-amber-600",
            feedback.tone === "error" && "text-rose-600"
          )}
        >
          {feedback.message}
          {feedback.solution && (
            <span className="ml-2 text-slate-500">
              {t.correctSolution} {feedback.solution}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
