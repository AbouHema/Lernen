"use client";

import * as React from "react";

type SpeechResult = "correct" | "incorrect" | "almost" | "unsupported" | null;

type StartListeningHandler = () => void;

type SpeechTrainerState = {
  isListening: boolean;
  transcript: string;
  lastResult: SpeechResult;
  attempts: number;
};

type SpeechTrainerOptions = {
  lang?: string;
  strictMode?: boolean;
  enableSimilarity?: boolean;
  similarityThreshold?: number;
  nearThreshold?: number;
  removeDiacritics?: boolean;
  ignoreArticles?: boolean;
};

type StartRequest = {
  expectedText: string;
  onCorrect: StartListeningHandler;
  onWrong: StartListeningHandler;
};

const DEFAULT_OPTIONS: Required<SpeechTrainerOptions> = {
  lang: "de-DE",
  strictMode: true,
  enableSimilarity: false,
  similarityThreshold: 0.9,
  nearThreshold: 0.8,
  removeDiacritics: true,
  ignoreArticles: false
};

const ARTICLE_REGEX = /\b(der|die|das)\b/g;
const PUNCTUATION_REGEX = /[.,!?]/g;

const stripDiacritics = (input: string) =>
  input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const collapseWhitespace = (input: string) => input.replace(/\s+/g, " ").trim();

const computeLevenshteinDistance = (source: string, target: string) => {
  if (source === target) return 0;
  if (!source) return target.length;
  if (!target) return source.length;

  const prevRow = Array.from({ length: target.length + 1 }, (_, index) => index);
  for (let i = 1; i <= source.length; i += 1) {
    let prevDiagonal = prevRow[0];
    prevRow[0] = i;
    for (let j = 1; j <= target.length; j += 1) {
      const temp = prevRow[j];
      const cost = source[i - 1] === target[j - 1] ? 0 : 1;
      prevRow[j] = Math.min(
        prevRow[j] + 1,
        prevRow[j - 1] + 1,
        prevDiagonal + cost
      );
      prevDiagonal = temp;
    }
  }
  return prevRow[target.length];
};

const computeSimilarity = (source: string, target: string) => {
  const maxLength = Math.max(source.length, target.length);
  if (maxLength === 0) return 1;
  const distance = computeLevenshteinDistance(source, target);
  return 1 - distance / maxLength;
};

export function useSpeechTrainer(options: SpeechTrainerOptions = {}) {
  const optionsRef = React.useRef<Required<SpeechTrainerOptions>>({
    ...DEFAULT_OPTIONS,
    ...options
  });

  React.useEffect(() => {
    optionsRef.current = { ...DEFAULT_OPTIONS, ...options };
  }, [options]);

  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  const isListeningRef = React.useRef(false);
  const pendingStartRef = React.useRef<StartRequest | null>(null);
  const lastExpectedRef = React.useRef<string | null>(null);
  const expectedTextRef = React.useRef<string>("");
  const onCorrectRef = React.useRef<StartListeningHandler>(() => undefined);
  const onWrongRef = React.useRef<StartListeningHandler>(() => undefined);

  const [state, setState] = React.useState<SpeechTrainerState>({
    isListening: false,
    transcript: "",
    lastResult: null,
    attempts: 0
  });

  const normalizeText = React.useCallback((input: string, overrides: SpeechTrainerOptions = {}) => {
    const merged = { ...optionsRef.current, ...overrides };
    let output = input.trim().toLowerCase();
    if (merged.removeDiacritics) {
      output = stripDiacritics(output);
    }
    output = output.replace(PUNCTUATION_REGEX, "");
    output = collapseWhitespace(output);

    if (!merged.strictMode && merged.ignoreArticles) {
      output = collapseWhitespace(output.replace(ARTICLE_REGEX, " "));
    }

    return output;
  }, []);

  const evaluateTranscript = React.useCallback((transcript: string, expectedText: string) => {
    const normalizedTranscript = normalizeText(transcript);
    const normalizedExpected = normalizeText(expectedText);
    const { enableSimilarity, similarityThreshold, nearThreshold } = optionsRef.current;
    if (!normalizedExpected) {
      return { result: "incorrect" as const, similarity: 0 };
    }
    if (normalizedTranscript === normalizedExpected) {
      return { result: "correct" as const, similarity: 1 };
    }

    if (enableSimilarity) {
      const similarity = computeSimilarity(normalizedTranscript, normalizedExpected);
      if (similarity >= similarityThreshold) {
        return { result: "correct" as const, similarity };
      }
      if (similarity >= nearThreshold) {
        return { result: "almost" as const, similarity };
      }
      return { result: "incorrect" as const, similarity };
    }

    return { result: "incorrect" as const, similarity: 0 };
  }, [normalizeText]);

  const startRecognition = React.useCallback((request: StartRequest) => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    expectedTextRef.current = request.expectedText;
    onCorrectRef.current = request.onCorrect;
    onWrongRef.current = request.onWrong;

    isListeningRef.current = true;
    setState((prev) => ({
      ...prev,
      isListening: true,
      transcript: "",
      lastResult: null
    }));
    recognition.lang = optionsRef.current.lang;
    recognition.start();
  }, []);

  const startListening = React.useCallback(
    (expectedText: string, onCorrect: StartListeningHandler, onWrong: StartListeningHandler) => {
      const recognition = recognitionRef.current;
      if (!recognition) {
        setState((prev) => ({
          ...prev,
          lastResult: "unsupported",
          isListening: false
        }));
        return;
      }

      const request: StartRequest = { expectedText, onCorrect, onWrong };

      if (lastExpectedRef.current !== expectedText) {
        lastExpectedRef.current = expectedText;
        setState((prev) => ({ ...prev, attempts: 0, lastResult: null, transcript: "" }));
      }

      if (isListeningRef.current) {
        pendingStartRef.current = request;
        recognition.stop();
        return;
      }

      startRecognition(request);
    },
    [startRecognition]
  );

  const stopListening = React.useCallback(() => {
    const recognition = recognitionRef.current;
    pendingStartRef.current = null;
    if (!recognition || !isListeningRef.current) {
      setState((prev) => ({ ...prev, isListening: false }));
      isListeningRef.current = false;
      return;
    }
    recognition.stop();
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionConstructor =
      window.SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setState((prev) => ({ ...prev, lastResult: "unsupported" }));
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      const expectedText = expectedTextRef.current;
      const { result } = evaluateTranscript(transcript, expectedText);

      setState((prev) => ({
        ...prev,
        transcript,
        lastResult: result,
        attempts: result === "correct" ? 0 : prev.attempts + 1
      }));

      if (result === "correct") {
        onCorrectRef.current();
      } else {
        onWrongRef.current();
      }
    };

    recognition.onerror = () => {
      setState((prev) => ({ ...prev, isListening: false, lastResult: "incorrect" }));
      isListeningRef.current = false;
      onWrongRef.current();
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setState((prev) => ({ ...prev, isListening: false }));
      if (pendingStartRef.current) {
        const nextRequest = pendingStartRef.current;
        pendingStartRef.current = null;
        startRecognition(nextRequest);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      pendingStartRef.current = null;
      isListeningRef.current = false;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [evaluateTranscript, startRecognition]);

  return {
    state,
    startListening,
    stopListening,
    normalizeText
  };
}
