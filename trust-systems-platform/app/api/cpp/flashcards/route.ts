import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateNextReview } from "@/lib/flashcard-scheduler";

/** GET: fetch due C++ flashcards */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const now = new Date();

  // Due cards (sorted oldest first)
  const dueCards = await prisma.userCppFlashcard.findMany({
    where: { userId: user.id, suspended: false, dueAt: { lte: now } },
    include: { card: true },
    orderBy: { dueAt: "asc" },
    take: 20,
  });

  // New cards not yet reviewed
  const newCards = await prisma.userCppFlashcard.findMany({
    where: { userId: user.id, suspended: false, repetitions: 0, dueAt: { lte: now } },
    include: { card: true },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  // Combine & dedupe
  const seenIds = new Set<string>();
  const cards = [...dueCards, ...newCards].filter((c) => {
    if (seenIds.has(c.id)) return false;
    seenIds.add(c.id);
    return true;
  });

  // Stats
  const [totalCount, dueCount, masteredCount] = await Promise.all([
    prisma.userCppFlashcard.count({ where: { userId: user.id, suspended: false } }),
    prisma.userCppFlashcard.count({ where: { userId: user.id, suspended: false, dueAt: { lte: now } } }),
    prisma.userCppFlashcard.count({ where: { userId: user.id, suspended: false, intervalDays: { gte: 21 } } }),
  ]);

  return NextResponse.json({
    cards: cards.map((c) => ({
      id: c.id,
      cardId: c.cardId,
      front: c.card.front,
      back: c.card.back,
      cardType: c.card.cardType,
      moduleNumber: c.card.moduleNumber,
      difficulty: c.card.difficulty,
      exerciseSlug: c.card.exerciseSlug,
      easeFactor: c.easeFactor,
      intervalDays: c.intervalDays,
      repetitions: c.repetitions,
      lapseCount: c.lapseCount,
    })),
    stats: { total: totalCount, due: dueCount, mastered: masteredCount },
  });
}

/** POST: submit a review grade (0-3) for a C++ flashcard */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { userFlashcardId, grade } = await request.json();
  if (!userFlashcardId || grade === undefined) {
    return NextResponse.json({ error: "Missing userFlashcardId or grade" }, { status: 400 });
  }
  if (grade < 0 || grade > 3) {
    return NextResponse.json({ error: "Grade must be 0-3" }, { status: 400 });
  }

  const uf = await prisma.userCppFlashcard.findUnique({ where: { id: userFlashcardId } });
  if (!uf || uf.userId !== user.id) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const review = calculateNextReview({
    grade,
    repetitions: uf.repetitions,
    easeFactor: uf.easeFactor,
    intervalDays: uf.intervalDays,
  });

  const now = new Date();
  const dueAt = new Date(now.getTime() + review.intervalDays * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.userCppFlashcard.update({
      where: { id: uf.id },
      data: {
        easeFactor: review.easeFactor,
        intervalDays: review.intervalDays,
        repetitions: review.repetitions,
        dueAt,
        lastReviewedAt: now,
        lapseCount: grade === 0 ? uf.lapseCount + 1 : uf.lapseCount,
        updatedAt: now,
      },
    }),
    prisma.cppFlashcardReview.create({
      data: {
        userFlashcardId: uf.id,
        grade,
        prevInterval: uf.intervalDays,
        newInterval: review.intervalDays,
        prevEase: uf.easeFactor,
        newEase: review.easeFactor,
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    nextReview: {
      intervalDays: review.intervalDays,
      easeFactor: review.easeFactor,
      dueAt: dueAt.toISOString(),
    },
  });
}
