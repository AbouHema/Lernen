"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { vocabulary } from "@/data/vocabulary";
import { sentences } from "@/data/sentences";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useApp } from "@/components/providers";
import { cn } from "@/lib/utils";
import { getQuizHistory, setQuizHistory, getStreak, setStreak } from "@/lib/storage";

function getRandomOptions(correct: string, pool: string[], count = 4) {
  const options = new Set([correct]);
  while (options.size < count) {
    options.add(pool[Math.floor(Math.random() * pool.length)]);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
}

export function ExercisePanel() {
  const { t, locale } = useApp();
  const isRtl = locale === "ar";

  const [cardIndex, setCardIndex] = React.useState(0);
  const [showBack, setShowBack] = React.useState(false);

  const [mcIndex, setMcIndex] = React.useState(0);
  const [mcAnswer, setMcAnswer] = React.useState<string | null>(null);

  const [gapIndex, setGapIndex] = React.useState(0);
  const [gapAnswer, setGapAnswer] = React.useState("");
  const [gapResult, setGapResult] = React.useState<"correct" | "incorrect" | null>(null);

  const [quizStep, setQuizStep] = React.useState(0);
  const [quizAnswers, setQuizAnswers] = React.useState<Record<number, string>>({});
  const quizItems = React.useMemo(() => vocabulary.slice(0, 10), []);

  const currentCard = vocabulary[cardIndex % vocabulary.length];
  const mcItem = vocabulary[mcIndex % vocabulary.length];
  const gapItem = sentences[gapIndex % sentences.length];
  const gapWord = gapItem.german.split(" ").pop() || "";

  const mcOptions = React.useMemo(
    () => getRandomOptions(`${mcItem.article} ${mcItem.german}`, vocabulary.map((item) => `${item.article} ${item.german}`)),
    [mcItem]
  );

  const quizOptions = React.useMemo(() => {
    const current = quizItems[quizStep];
    return current
      ? getRandomOptions(`${current.article} ${current.german}`, vocabulary.map((item) => `${item.article} ${item.german}`))
      : [];
  }, [quizItems, quizStep]);

  const checkGap = () => {
    const normalized = gapAnswer.trim().toLowerCase();
    const correct = gapWord.toLowerCase();
    setGapResult(normalized === correct ? "correct" : "incorrect");
  };

  const finishQuiz = () => {
    const score = quizItems.reduce((acc, item, index) => {
      const answer = quizAnswers[index];
      return acc + (answer === `${item.article} ${item.german}` ? 1 : 0);
    }, 0);
    const history = getQuizHistory();
    const nextHistory = [...history, { date: new Date().toISOString().slice(0, 10), score }];
    setQuizHistory(nextHistory);
    setStreak(getStreak() + 1);
  };

  return (
    <Tabs defaultValue="flashcards" className="space-y-6">
      <TabsList className={cn(isRtl && "flex-row-reverse")}> 
        <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
        <TabsTrigger value="choice">Multiple Choice</TabsTrigger>
        <TabsTrigger value="gap">Lückentext</TabsTrigger>
        <TabsTrigger value="quiz">Mini-Quiz</TabsTrigger>
      </TabsList>

      <TabsContent value="flashcards">
        <Card className="card-surface">
          <CardContent className="space-y-6 p-6">
            <motion.div
              key={currentCard.id + showBack}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-slate-100 bg-white p-8 text-center"
            >
              <p className="text-3xl font-semibold">{showBack ? `${currentCard.article} ${currentCard.german}` : currentCard.arabic}</p>
              <p className="mt-3 text-sm text-slate-500">{showBack ? currentCard.example_de : currentCard.example_ar}</p>
            </motion.div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowBack((prev) => !prev)}>
                {showBack ? t.back : t.next}
              </Button>
              <Button
                onClick={() => {
                  setCardIndex((prev) => prev + 1);
                  setShowBack(false);
                }}
              >
                {t.next}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="choice">
        <Card className="card-surface">
          <CardContent className="space-y-5 p-6">
            <div className={cn("space-y-2", isRtl && "text-right")}> 
              <Badge variant="outline">{mcItem.category}</Badge>
              <p className="text-2xl font-semibold">{mcItem.arabic}</p>
              <p className="text-sm text-slate-500">{mcItem.example_ar}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {mcOptions.map((option) => {
                const active = mcAnswer === option;
                return (
                  <Button
                    key={option}
                    variant={active ? "default" : "outline"}
                    onClick={() => setMcAnswer(option)}
                  >
                    {option}
                  </Button>
                );
              })}
            </div>
            {mcAnswer && (
              <p className="text-sm text-slate-500">
                {mcAnswer === `${mcItem.article} ${mcItem.german}` ? t.correct : t.incorrect}
              </p>
            )}
            <Button
              onClick={() => {
                setMcIndex((prev) => prev + 1);
                setMcAnswer(null);
              }}
            >
              {t.next}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="gap">
        <Card className="card-surface">
          <CardContent className="space-y-5 p-6">
            <div className={cn("space-y-2", isRtl && "text-right")}> 
              <Badge variant="outline">{gapItem.category}</Badge>
              <p className="text-lg font-semibold">
                {gapItem.german.replace(gapWord, "_____")}
              </p>
              <p className="text-sm text-slate-500">{gapItem.arabic}</p>
            </div>
            <div className={cn("flex flex-col gap-3 md:flex-row", isRtl && "md:flex-row-reverse")}> 
              <Input value={gapAnswer} onChange={(event) => setGapAnswer(event.target.value)} />
              <Button onClick={checkGap}>{t.submit}</Button>
            </div>
            {gapResult && (
              <p className="text-sm text-slate-500">
                {gapResult === "correct" ? t.correct : `${t.incorrect} – ${gapWord}`}
              </p>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setGapIndex((prev) => prev + 1);
                setGapAnswer("");
                setGapResult(null);
              }}
            >
              {t.next}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="quiz">
        <Card className="card-surface">
          <CardContent className="space-y-6 p-6">
            {quizStep < quizItems.length ? (
              <>
                <div className={cn("space-y-2", isRtl && "text-right")}> 
                  <Badge variant="outline">Frage {quizStep + 1}/10</Badge>
                  <p className="text-2xl font-semibold">{quizItems[quizStep].arabic}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {quizOptions.map((option) => (
                    <Button
                      key={option}
                      variant={quizAnswers[quizStep] === option ? "default" : "outline"}
                      onClick={() => setQuizAnswers((prev) => ({ ...prev, [quizStep]: option }))}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={() => {
                    if (quizStep + 1 === quizItems.length) {
                      finishQuiz();
                    }
                    setQuizStep((prev) => prev + 1);
                  }}
                >
                  {quizStep + 1 === quizItems.length ? t.review : t.next}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-2xl font-semibold">{t.review}</p>
                <div className="space-y-3">
                  {quizItems.map((item, index) => {
                    const correct = `${item.article} ${item.german}`;
                    const answer = quizAnswers[index];
                    return (
                      <div key={item.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                        <p className="text-sm text-slate-500">{item.arabic}</p>
                        <p className="font-semibold">{correct}</p>
                        <p className="text-xs text-slate-500">Antwort: {answer ?? "-"}</p>
                      </div>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuizStep(0);
                    setQuizAnswers({});
                  }}
                >
                  {t.reset}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
