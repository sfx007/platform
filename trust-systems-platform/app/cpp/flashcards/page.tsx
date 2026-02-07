"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface CppCard {
  id: string;
  moduleNumber: number;
  cardType: string;
  front: string;
  back: string;
  difficulty: string;
  exerciseSlug: string | null;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export default function CppFlashcardsPage() {
  const [cards, setCards] = useState<CppCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ total: 0, due: 0, mastered: 0 });
  const [loading, setLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cpp/flashcards");
      if (!res.ok) return;
      const data = await res.json();
      setCards(data.cards ?? []);
      setStats(data.stats ?? { total: 0, due: 0, mastered: 0 });
      setCurrentIndex(0);
      setFlipped(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  async function gradeCard(grade: number) {
    const card = cards[currentIndex];
    if (!card) return;

    await fetch("/api/cpp/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flashcardId: card.id, grade }),
    });

    setReviewCount((c) => c + 1);
    setFlipped(false);

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Refresh to get new cards
      await fetchCards();
    }
  }

  const card = cards[currentIndex];
  const progress = cards.length > 0 ? Math.round(((currentIndex + 1) / cards.length) * 100) : 0;

  const typeColors: Record<string, string> = {
    concept: "bg-blue-900/40 text-blue-300",
    code: "bg-green-900/40 text-green-300",
    debug: "bg-red-900/40 text-red-300",
    decision: "bg-purple-900/40 text-purple-300",
    gotcha: "bg-orange-900/40 text-orange-300",
    comparison: "bg-cyan-900/40 text-cyan-300",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-float-up">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/cpp" className="hover:text-gray-300 transition-colors">C++ Modules</Link>
        <span>/</span>
        <span className="text-gray-300">Flashcards</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <span className="inline-block px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 text-xs font-medium mb-2">
          SPACED REPETITION
        </span>
        <h1 className="text-2xl font-bold text-gray-50 font-heading">C++ Flashcards</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review cards daily to reinforce C++ concepts, patterns, and gotchas.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="card p-3 text-center">
          <span className="text-xl font-bold text-blue-400">{stats.due}</span>
          <span className="block text-xs text-gray-500">Due</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-xl font-bold text-green-400">{stats.mastered}</span>
          <span className="block text-xs text-gray-500">Mastered</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-xl font-bold text-gray-400">{stats.total}</span>
          <span className="block text-xs text-gray-500">Total</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-xl font-bold text-purple-400">{reviewCount}</span>
          <span className="block text-xs text-gray-500">Reviewed</span>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <span className="text-gray-500">Loading cards…</span>
        </div>
      ) : cards.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-4xl mb-3 block">🎉</span>
          <h2 className="text-xl font-bold text-gray-100">All caught up!</h2>
          <p className="text-gray-400 mt-2">No cards due right now. Come back later.</p>
          <Link href="/cpp/dashboard" className="btn-secondary text-sm mt-4 inline-block px-4 py-2">
            ← Back to Dashboard
          </Link>
        </div>
      ) : card ? (
        <>
          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Card {currentIndex + 1} of {cards.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Card */}
          <div
            className="card p-6 mb-4 cursor-pointer select-none min-h-[240px] flex flex-col justify-between"
            onClick={() => setFlipped(!flipped)}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2 py-0.5 rounded ${typeColors[card.cardType] ?? "bg-gray-800 text-gray-400"}`}>
                {card.cardType.toUpperCase()}
              </span>
              <span className="text-xs text-gray-600">Module {String(card.moduleNumber).padStart(2, "0")}</span>
              {card.exerciseSlug && (
                <span className="text-xs text-gray-600">· {card.exerciseSlug}</span>
              )}
            </div>

            {!flipped ? (
              <div>
                <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap">{card.front}</p>
                <p className="text-xs text-gray-600 mt-4 text-center">Tap to reveal answer</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-2">Q: {card.front}</p>
                <div className="border-t border-gray-700 pt-3">
                  <p className="text-base text-gray-200 leading-relaxed whitespace-pre-wrap">{card.back}</p>
                </div>
              </div>
            )}
          </div>

          {/* Grade Buttons (only when flipped) */}
          {flipped && (
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => gradeCard(0)}
                className="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm hover:bg-red-900/50 transition-colors"
              >
                Again<br /><span className="text-xs text-red-400/70">&lt;1 min</span>
              </button>
              <button
                onClick={() => gradeCard(1)}
                className="p-3 rounded-lg bg-orange-900/30 border border-orange-800 text-orange-300 text-sm hover:bg-orange-900/50 transition-colors"
              >
                Hard<br /><span className="text-xs text-orange-400/70">~6 min</span>
              </button>
              <button
                onClick={() => gradeCard(2)}
                className="p-3 rounded-lg bg-green-900/30 border border-green-800 text-green-300 text-sm hover:bg-green-900/50 transition-colors"
              >
                Good<br /><span className="text-xs text-green-400/70">~10 min</span>
              </button>
              <button
                onClick={() => gradeCard(3)}
                className="p-3 rounded-lg bg-blue-900/30 border border-blue-800 text-blue-300 text-sm hover:bg-blue-900/50 transition-colors"
              >
                Easy<br /><span className="text-xs text-blue-400/70">4 days</span>
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
