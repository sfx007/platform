/**
 * C++ Modules: Core library functions for exercise progress, skills, and daily missions.
 */

import { prisma } from "@/lib/db";

// ── TYPES ────────────────────────────────────────────────────

export interface CppModuleWithExercises {
  id: string;
  number: number;
  title: string;
  slug: string;
  description: string;
  order: number;
  exercises: CppExerciseInfo[];
}

export interface CppExerciseInfo {
  id: string;
  number: number;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedHours: number;
  filesRequired: string[];
  skillsSummary: string;
  order: number;
  status?: string;        // from UserCppExercise
  defenseScore?: number | null;
  gitRepoLink?: string | null;
}

export interface DailyMission {
  exercise: CppExerciseInfo;
  module: { number: number; title: string; slug: string };
  warmup: MissionPhase;
  coreWork: MissionPhase;
  prove: MissionPhase;
  cooldown: MissionPhase;
}

export interface MissionPhase {
  label: string;
  duration: string;
  tasks: string[];
}

export interface CppDashboardData {
  streak: number;
  totalXp: number;
  cardsDue: number;
  modulesProgress: ModuleProgress[];
  currentMission: DailyMission | null;
  skillsSummary: { total: number; unlocked: number; bronze: number; silver: number; gold: number };
  flashcardsSummary: { total: number; mastered: number; due: number };
  achievements: string[];
  nextMilestone: string;
}

export interface ModuleProgress {
  module: { number: number; title: string; slug: string };
  exercisesTotal: number;
  exercisesCompleted: number;
  exercisesDefended: number;
  pct: number;
}

// ── QUERIES ──────────────────────────────────────────────────

/** Get all modules with exercises + user progress */
export async function getCppModules(userId: string): Promise<CppModuleWithExercises[]> {
  const modules = await prisma.cppModule.findMany({
    orderBy: { order: "asc" },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: {
          userProgress: {
            where: { userId },
          },
        },
      },
    },
  });

  return modules.map((m) => ({
    ...m,
    exercises: m.exercises.map((ex) => {
      const up = ex.userProgress[0];
      return {
        id: ex.id,
        number: ex.number,
        slug: ex.slug,
        title: ex.title,
        description: ex.description,
        difficulty: ex.difficulty,
        estimatedHours: ex.estimatedHours,
        filesRequired: JSON.parse(ex.filesRequired),
        skillsSummary: ex.skillsSummary,
        order: ex.order,
        status: up?.status ?? "not_started",
        defenseScore: up?.defenseScore ?? null,
        gitRepoLink: up?.gitRepoLink ?? null,
      };
    }),
  }));
}

/** Get a single exercise with full details */
export async function getCppExercise(slug: string, userId: string) {
  const exercise = await prisma.cppExercise.findUnique({
    where: { slug },
    include: {
      module: true,
      userProgress: { where: { userId } },
    },
  });
  if (!exercise) return null;

  const up = exercise.userProgress[0];
  return {
    ...exercise,
    filesRequired: JSON.parse(exercise.filesRequired),
    status: up?.status ?? "not_started",
    defenseScore: up?.defenseScore ?? null,
    gitRepoLink: up?.gitRepoLink ?? null,
    notes: up?.notes ?? "",
    startedAt: up?.startedAt ?? null,
    completedAt: up?.completedAt ?? null,
  };
}

/** Get dashboard data for the C++ path */
export async function getCppDashboard(userId: string): Promise<CppDashboardData> {
  const [
    user,
    modules,
    userExercises,
    userSkills,
    dueCards,
    totalCards,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.cppModule.findMany({
      orderBy: { order: "asc" },
      include: { exercises: { orderBy: { order: "asc" } } },
    }),
    prisma.userCppExercise.findMany({ where: { userId } }),
    prisma.userCppSkill.findMany({ where: { userId } }),
    prisma.userCppFlashcard.count({
      where: { userId, suspended: false, dueAt: { lte: new Date() } },
    }),
    prisma.userCppFlashcard.count({ where: { userId, suspended: false } }),
  ]);

  // Module progress
  const exerciseStatusMap = new Map(userExercises.map((ue) => [ue.exerciseId, ue.status]));
  const modulesProgress: ModuleProgress[] = modules.map((m) => {
    const total = m.exercises.length;
    const completed = m.exercises.filter(
      (ex) => exerciseStatusMap.get(ex.id) === "completed" || exerciseStatusMap.get(ex.id) === "defended"
    ).length;
    const defended = m.exercises.filter(
      (ex) => exerciseStatusMap.get(ex.id) === "defended"
    ).length;
    return {
      module: { number: m.number, title: m.title, slug: m.slug },
      exercisesTotal: total,
      exercisesCompleted: completed,
      exercisesDefended: defended,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  // Skills summary
  const skillsSummary = {
    total: 15,
    unlocked: userSkills.filter((s) => s.level !== "locked").length,
    bronze: userSkills.filter((s) => s.level === "bronze").length,
    silver: userSkills.filter((s) => s.level === "silver").length,
    gold: userSkills.filter((s) => s.level === "gold").length,
  };

  // Mastered = interval > 21 days
  const masteredCards = await prisma.userCppFlashcard.count({
    where: { userId, suspended: false, intervalDays: { gte: 21 } },
  });

  // Current mission: find next incomplete exercise
  const currentMission = findCurrentMission(modules, exerciseStatusMap);

  // Achievements
  const achievements = computeAchievements(modulesProgress, skillsSummary, userExercises);

  // Next milestone
  const nextMilestone = computeNextMilestone(modulesProgress, skillsSummary);

  return {
    streak: user?.currentStreak ?? 0,
    totalXp: user?.xp ?? 0,
    cardsDue: dueCards,
    modulesProgress,
    currentMission,
    skillsSummary,
    flashcardsSummary: { total: totalCards, mastered: masteredCards, due: dueCards },
    achievements,
    nextMilestone,
  };
}

/** Update exercise status */
export async function updateExerciseStatus(
  userId: string,
  exerciseSlug: string,
  status: string,
  extra?: { gitRepoLink?: string; notes?: string; defenseScore?: number }
) {
  const exercise = await prisma.cppExercise.findUnique({ where: { slug: exerciseSlug } });
  if (!exercise) throw new Error("Exercise not found");

  const now = new Date();
  const data: Record<string, unknown> = {
    status,
    updatedAt: now,
    ...(extra?.gitRepoLink && { gitRepoLink: extra.gitRepoLink }),
    ...(extra?.notes !== undefined && { notes: extra.notes }),
    ...(extra?.defenseScore !== undefined && { defenseScore: extra.defenseScore }),
  };

  if (status === "in_progress") data.startedAt = now;
  if (status === "completed" || status === "defended") data.completedAt = now;
  if (status === "defended" && extra?.defenseScore !== undefined) {
    data.defenseDate = now;
    data.defenseScore = extra.defenseScore;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createData: Record<string, unknown> = { userId, exerciseId: exercise.id, ...data };
  return prisma.userCppExercise.upsert({
    where: { userId_exerciseId: { userId, exerciseId: exercise.id } },
    update: data,
    create: createData as never,
  });
}

// ── HELPERS ──────────────────────────────────────────────────

function findCurrentMission(
  modules: Array<{ number: number; title: string; slug: string; exercises: Array<{ id: string; slug: string; title: string; description: string; skillsSummary: string; difficulty: string; estimatedHours: number; filesRequired: string; order: number }> }>,
  statusMap: Map<string, string>
): DailyMission | null {
  for (const mod of modules) {
    for (const ex of mod.exercises) {
      const status = statusMap.get(ex.id);
      if (!status || status === "not_started" || status === "in_progress") {
        const files: string[] = JSON.parse(ex.filesRequired);
        return {
          exercise: {
            id: ex.id,
            number: ex.order,
            slug: ex.slug,
            title: ex.title,
            description: ex.description,
            difficulty: ex.difficulty,
            estimatedHours: ex.estimatedHours,
            filesRequired: files,
            skillsSummary: ex.skillsSummary,
            order: ex.order,
            status: status ?? "not_started",
          },
          module: { number: mod.number, title: mod.title, slug: mod.slug },
          warmup: {
            label: "🔥 WARMUP",
            duration: "10 min",
            tasks: [
              "Flashcard Review: Review due cards",
              `Quick Kata: Write ${ex.skillsSummary.split(",")[0]?.trim() || "key concept"} from memory`,
              "Review: Previous exercise concepts",
            ],
          },
          coreWork: {
            label: "💪 CORE WORK",
            duration: `${Math.max(60, ex.estimatedHours * 30)} min`,
            tasks: generateCoreTasks(ex),
          },
          prove: {
            label: "✅ PROVE",
            duration: "15 min",
            tasks: [
              "Upload: Git commit hash",
              "Explain: Key concept in your own words",
              "Self-test: Answer 3 questions on today's topic",
            ],
          },
          cooldown: {
            label: "🧊 COOLDOWN",
            duration: "10 min",
            tasks: [
              "Create: 2 flashcards on today's topic",
              "Log: Hardest bug you fixed today",
              "Note: One 'aha!' moment",
            ],
          },
        };
      }
    }
  }
  return null;
}

function generateCoreTasks(ex: { title: string; description: string; skillsSummary: string; filesRequired: string }): string[] {
  const files: string[] = JSON.parse(ex.filesRequired);
  const tasks: string[] = [];
  tasks.push(`SET 1: Read and understand the exercise requirements (20 min)`);
  if (files.length > 2) {
    tasks.push(`SET 2: Create class skeleton — ${files.filter(f => f.endsWith('.hpp')).join(', ')} (30 min)`);
  }
  tasks.push(`SET 3: Implement core logic — ${ex.skillsSummary} (30-60 min)`);
  tasks.push(`SET 4: Write test cases + edge cases (20 min)`);
  tasks.push(`SET 5: Compile with -Wall -Wextra -Werror and fix warnings`);
  return tasks;
}

function computeAchievements(
  modulesProgress: ModuleProgress[],
  skillsSummary: { unlocked: number; bronze: number; silver: number; gold: number },
  userExercises: Array<{ status: string }>
): string[] {
  const achievements: string[] = [];

  // Module completions
  const moduleNames: Record<number, string> = { 5: "Exception Master", 6: "Cast Wizard", 7: "Template Guru", 8: "STL Architect", 9: "STL Master" };
  for (const mp of modulesProgress) {
    if (mp.pct === 100) achievements.push(moduleNames[mp.module.number] || "Module Complete");
  }

  // All modules
  if (modulesProgress.every((mp) => mp.pct === 100)) achievements.push("C++98 Graduate");

  // Skill achievements
  if (skillsSummary.bronze >= 8) achievements.push("Bronze Collector");
  if (skillsSummary.silver >= 5) achievements.push("Silver Specialist");

  // Defense achievements
  const defended = userExercises.filter((ue) => ue.status === "defended").length;
  if (defended >= 1) achievements.push("First Defense");
  if (defended >= 15) achievements.push("Full Defense");

  return achievements;
}

function computeNextMilestone(
  modulesProgress: ModuleProgress[],
  skillsSummary: { unlocked: number; bronze: number }
): string {
  // Find first incomplete module
  for (const mp of modulesProgress) {
    if (mp.pct < 100) {
      const remaining = mp.exercisesTotal - mp.exercisesCompleted;
      return `Complete ${remaining} more exercise${remaining > 1 ? "s" : ""} in Module ${mp.module.number} (${mp.module.title})`;
    }
  }
  if (skillsSummary.bronze < 8) {
    return `Achieve Bronze in ${8 - skillsSummary.bronze} more skills`;
  }
  return "All modules complete! 🎉 Keep practicing for mastery.";
}
