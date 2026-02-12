import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getPartSupplementalContent } from "@/lib/part-content";
import { inferLessonKindFromRecord } from "@/lib/content-kind";

export default async function PartsPage() {
  const user = await getCurrentUser();

  /* ── Fetch courses with their parts ── */
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: {
      parts: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, slug: true, title: true, contentId: true },
          },
          quest: true,
        },
      },
    },
  });

  /* Also get unassigned parts (backward compat — parts with no course) */
  const unassignedParts = await prisma.part.findMany({
    where: { courseId: null },
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: { id: true, slug: true, title: true, contentId: true },
      },
      quest: true,
    },
  });

  /* ── Combine all parts for progress computation ── */
  const allParts = [...courses.flatMap(c => c.parts), ...unassignedParts];

  /* ── Fetch all progress in one query instead of many ── */
  const progressRows = user
    ? await prisma.userProgress.findMany({ where: { userId: user.id } })
    : [];

  const passedSubmissions = user
    ? await prisma.submission.findMany({
        where: { userId: user.id, status: "passed" },
        select: {
          lessonId: true,
          questId: true,
          lesson: { select: { partId: true } },
          quest: { select: { partId: true } },
        },
      })
    : [];

  const lessonSetByPart = new Map<string, Set<string>>();
  const questPartSet = new Set<string>();
  for (const sub of passedSubmissions) {
    if (sub.lessonId && sub.lesson?.partId) {
      const existing = lessonSetByPart.get(sub.lesson.partId) ?? new Set<string>();
      existing.add(sub.lessonId);
      lessonSetByPart.set(sub.lesson.partId, existing);
    }
    if (sub.questId && sub.quest?.partId) {
      questPartSet.add(sub.quest.partId);
    }
  }

  const progressMap = new Map(progressRows.map((r) => [r.partId, r]));

  /* Compute status for every part */
  function computePartStatus(part: typeof allParts[number]) {
    const supplemental = getPartSupplementalContent(part.slug);
    const coreLessonIds = new Set(
      part.lessons
        .filter((lesson) => {
          const kind =
            supplemental?.lessonKindBySlug.get(lesson.slug) ??
            inferLessonKindFromRecord({
              title: lesson.title,
              slug: lesson.slug,
              contentId: lesson.contentId,
            });
          return kind === "lesson";
        })
        .map((lesson) => lesson.id)
    );

    const p = progressMap.get(part.id);
    const doneFromProgress = p?.completedLessons ?? 0;
    const doneFromSubsRaw = lessonSetByPart.get(part.id) ?? new Set<string>();
    const doneFromSubs = Array.from(doneFromSubsRaw).filter((id) => coreLessonIds.has(id)).length;
    const total = coreLessonIds.size;
    const done = Math.min(total, Math.max(doneFromProgress, doneFromSubs));
    const questDone = (p?.questCompleted ?? false) || questPartSet.has(part.id);
    const isComplete = total > 0 && done >= total && questDone;
    return { done, total, questDone, isComplete };
  }

  /* Build status map for all parts */
  const statusMap = new Map<string, ReturnType<typeof computePartStatus>>();
  for (const part of allParts) {
    statusMap.set(part.id, computePartStatus(part));
  }

  /* Per-course: compute lock status (linear unlock within each course) */
  function computeCoursePartStatuses(parts: typeof allParts) {
    const statuses = parts.map(p => statusMap.get(p.id)!);
    const firstIncompleteIdx = statuses.findIndex((s) => !s.isComplete);
    return statuses.map((s, i) => ({
      ...s,
      isInProgress: i === firstIncompleteIdx,
      isLocked: i > firstIncompleteIdx && firstIncompleteIdx !== -1,
    }));
  }

  /* Course-level completion */
  function coursePct(parts: typeof allParts) {
    const statuses = parts.map(p => statusMap.get(p.id)!);
    const totalDone = statuses.reduce((s, x) => s + x.done, 0);
    const totalAll = statuses.reduce((s, x) => s + x.total, 0);
    return totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;
  }

  /* Also compute statuses for unassigned parts (legacy linear unlock) */
  const unassignedStatuses = computeCoursePartStatuses(unassignedParts);

  const hasCourses = courses.length > 0;
  const hasUnassigned = unassignedParts.length > 0;

  return (
    <div className="px-3 sm:px-6 py-4 sm:py-6 max-w-6xl mx-auto animate-float-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-yellow">LEARNING PATHS</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-100 mb-1">Courses</h1>
        <p className="text-gray-500 text-sm">
          Choose a course to begin your journey. Complete parts in order to unlock the next.
        </p>
      </div>

      {/* ── Course Cards ── */}
      {hasCourses && (
        <div className="grid gap-6 mb-8">
          {courses.map((course) => {
            const pct = coursePct(course.parts);
            const totalParts = course.parts.length;
            const completedParts = course.parts.filter(p => statusMap.get(p.id)?.isComplete).length;

            return (
              <Link
                key={course.id}
                href={`/parts/course/${course.slug}`}
                className="game-card p-6 group hover:border-yellow-500/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-600/10 flex items-center justify-center text-3xl flex-shrink-0">
                    {course.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-100 group-hover:text-yellow-500 transition-colors mb-1">
                      {course.title}
                    </h2>
                    {course.description && (
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2">{course.description}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? "bg-green-500" : "xp-bar"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-xs font-semibold whitespace-nowrap ${pct === 100 ? "text-green-400" : pct > 0 ? "text-yellow-400" : "text-gray-400"}`}>
                        {completedParts}/{totalParts} parts
                      </span>
                    </div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-yellow-500 transition-colors flex-shrink-0 mt-3">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Parts Track (within a selected course or unassigned) ── */}
      {(() => {
        /* Determine which parts to show in detail */
        /* If ?course=<slug> is in URL, this is a server component so we can't read searchParams directly.
           We'll show all courses as cards above. When there are unassigned parts, show them in the classic track view.
           If no courses exist at all, show all parts flat (backward compatibility). */

        const partsToShow = !hasCourses ? allParts : unassignedParts;
        const statusesToShow = !hasCourses ? computeCoursePartStatuses(allParts) : unassignedStatuses;

        if (partsToShow.length === 0) return null;

        return (
          <div>
            {hasCourses && hasUnassigned && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-100 mb-1">Other Parts</h2>
                <p className="text-gray-500 text-sm">Parts not assigned to any course yet.</p>
              </div>
            )}
            {!hasCourses && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-100 mb-1">All Parts</h2>
              </div>
            )}

            <div className="relative">
              {/* Track line */}
              {(() => {
                const n = partsToShow.length;
                if (n < 2) return null;
                const stops: string[] = [];
                for (let idx = 0; idx < n; idx++) {
                  const s = statusesToShow[idx];
                  const color = s.isComplete ? '#9ece6a' : s.isInProgress ? '#e0af68' : '#232838';
                  const pos = (idx / (n - 1)) * 100;
                  stops.push(`${color} ${pos.toFixed(1)}%`);
                }
                return (
                  <div
                    className="absolute left-[23px] w-[3px] rounded-full z-0"
                    style={{
                      top: '35px',
                      bottom: '35px',
                      background: `linear-gradient(to bottom, ${stops.join(', ')})`,
                    }}
                  />
                );
              })()}

              <div className="flex flex-col gap-5">
                {partsToShow.map((part, i) => {
                  const { done: completedLessons, total: totalLessons, isComplete, isInProgress, isLocked } = statusesToShow[i];
                  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                  const iconSrc = "/img/c-128.png";

                  return (
                    <Link key={part.id} href={`/parts/${part.slug}`} className="relative pl-14 group">
                      <div className={`absolute left-[10px] top-5 w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm z-10 border-2 transition-all ${
                        isComplete
                          ? "bg-green-950 border-green-500 text-green-400 shadow-[0_0_12px_rgba(74,222,128,0.3)]"
                          : isInProgress
                          ? "bg-yellow-950 border-yellow-500 text-yellow-400 animate-throb shadow-[0_0_12px_rgba(234,179,8,0.25)]"
                          : "bg-gray-850 border-gray-600 text-gray-500"
                      }`}>
                        {isComplete ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : isInProgress ? (
                          <span className="text-xs font-bold">{part.order}</span>
                        ) : isLocked ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        ) : (
                          <span className="text-xs font-bold">{part.order}</span>
                        )}
                      </div>

                      <div className={`game-card p-5 ${
                        isComplete ? "border-green-500/30" : isInProgress ? "border-yellow-500/30 game-card-active" : ""
                      }`}>
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isComplete ? "bg-green-950" : isInProgress ? "bg-yellow-950" : "bg-gray-800"
                          }`}>
                            <Image src={iconSrc} alt={part.title} width={32} height={32} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-[11px] uppercase tracking-widest font-semibold ${
                                isComplete ? "text-green-400" : isInProgress ? "text-yellow-400" : "text-gray-300"
                              }`}>Part {part.order} · {totalLessons} Lessons</span>
                              {isComplete && <span className="badge badge-success">Complete</span>}
                              {isInProgress && <span className="badge badge-yellow">In Progress</span>}
                              {isLocked && <span className="badge badge-danger">Locked</span>}
                            </div>
                            <h2 className="text-base font-semibold text-gray-100 group-hover:text-yellow-500 transition-colors mb-1">{part.title}</h2>
                            <p className="text-gray-500 text-sm line-clamp-1 mb-3">{part.description}</p>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-700 ${isComplete ? "bg-green-500" : "xp-bar"}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className={`text-xs font-semibold whitespace-nowrap ${
                                isComplete ? "text-green-400" : isInProgress ? "text-yellow-400" : "text-gray-400"
                              }`}>{completedLessons}/{totalLessons}</span>
                            </div>
                          </div>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-yellow-500 transition-colors flex-shrink-0 mt-2">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {allParts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-gray-300 mb-2">No Courses Yet</h2>
          <p className="text-gray-500">Courses will appear here once created by an admin.</p>
        </div>
      )}
    </div>
  );
}
