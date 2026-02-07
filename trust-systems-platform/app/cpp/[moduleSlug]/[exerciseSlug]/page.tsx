import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCppExercise } from "@/lib/cpp-modules";
import { prisma } from "@/lib/db";
import Link from "next/link";
import ExerciseActions from "@/app/components/cpp/exercise-actions";

interface Props {
  params: Promise<{ moduleSlug: string; exerciseSlug: string }>;
}

export default async function CppExercisePage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { moduleSlug, exerciseSlug } = await params;
  const exercise = await getCppExercise(exerciseSlug, user.id);
  if (!exercise) notFound();

  // Get related skills
  const skills = await prisma.cppSkill.findMany({
    where: { moduleNumber: exercise.module.number },
    include: { userCppSkills: { where: { userId: user.id } } },
  });

  // Get related flashcards count
  const flashcardCount = await prisma.cppFlashcard.count({
    where: { exerciseSlug: exercise.slug },
  });

  const diffColors: Record<string, string> = {
    easy: "text-green-400 bg-green-900/30 border-green-700/50",
    medium: "text-yellow-400 bg-yellow-900/30 border-yellow-700/50",
    hard: "text-red-400 bg-red-900/30 border-red-700/50",
  };

  const levelEmojis: Record<string, string> = {
    locked: "🔒",
    unlocked: "🔓",
    bronze: "🥉",
    silver: "🥈",
    gold: "🥇",
    platinum: "💎",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/cpp" className="hover:text-gray-300 transition-colors">C++ Modules</Link>
        <span>/</span>
        <Link href={`/cpp/${moduleSlug}`} className="hover:text-gray-300 transition-colors">
          Module {String(exercise.module.number).padStart(2, "0")}
        </Link>
        <span>/</span>
        <span className="text-gray-300">Ex{String(exercise.number).padStart(2, "0")}</span>
      </nav>

      {/* Exercise Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-0.5 rounded">
                Module {String(exercise.module.number).padStart(2, "0")} / Ex{String(exercise.number).padStart(2, "0")}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${diffColors[exercise.difficulty]}`}>
                {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-50 font-heading">{exercise.title}</h1>
            <p className="text-gray-400 mt-2">{exercise.description}</p>
          </div>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="bg-gray-900/60 rounded-lg p-3 text-center">
            <span className="text-xs text-gray-500 block">Estimated Time</span>
            <span className="text-lg font-bold text-gray-200">~{exercise.estimatedHours}h</span>
          </div>
          <div className="bg-gray-900/60 rounded-lg p-3 text-center">
            <span className="text-xs text-gray-500 block">Files Required</span>
            <span className="text-lg font-bold text-gray-200">{exercise.filesRequired.length}</span>
          </div>
          <div className="bg-gray-900/60 rounded-lg p-3 text-center">
            <span className="text-xs text-gray-500 block">Flashcards</span>
            <span className="text-lg font-bold text-gray-200">{flashcardCount}</span>
          </div>
          <div className="bg-gray-900/60 rounded-lg p-3 text-center">
            <span className="text-xs text-gray-500 block">Status</span>
            <span className="text-lg font-bold text-gray-200 capitalize">{exercise.status?.replace("_", " ")}</span>
          </div>
        </div>
      </div>

      {/* Action Panel */}
      <ExerciseActions
        slug={exercise.slug}
        status={exercise.status ?? "not_started"}
        gitRepoLink={exercise.gitRepoLink ?? ""}
        notes={exercise.notes ?? ""}
        defenseScore={exercise.defenseScore ?? undefined}
      />

      {/* Files Required */}
      <div className="card p-5 mb-4">
        <h2 className="text-base font-bold text-gray-100 mb-3">📁 Files to Submit</h2>
        <div className="flex flex-wrap gap-2">
          {exercise.filesRequired.map((f: string) => (
            <span key={f} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-sm font-mono text-gray-300">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Skills Practiced */}
      <div className="card p-5 mb-4">
        <h2 className="text-base font-bold text-gray-100 mb-3">🎯 Skills Practiced</h2>
        <p className="text-gray-400 text-sm mb-3">{exercise.skillsSummary}</p>
        <div className="grid gap-2 md:grid-cols-3">
          {skills.map((skill) => {
            const us = skill.userCppSkills[0];
            const level = us?.level ?? "locked";
            return (
              <div key={skill.slug} className="flex items-center gap-2 p-2 rounded bg-gray-900/60">
                <span>{levelEmojis[level]}</span>
                <div>
                  <span className="text-sm text-gray-200">{skill.title}</span>
                  <span className="block text-xs text-gray-500 capitalize">{level}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compilation Guide */}
      <div className="card p-5 mb-4">
        <h2 className="text-base font-bold text-gray-100 mb-3">🔧 Compilation Guide</h2>
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300">
          <p className="text-gray-500 mb-2"># Compile with required flags:</p>
          <p>c++ -Wall -Wextra -Werror -std=c++98 *.cpp -o {exercise.slug.replace("cpp0", "ex0").split("-")[0]}</p>
          <p className="text-gray-500 mt-3 mb-2"># Run:</p>
          <p>./{exercise.slug.replace("cpp0", "ex0").split("-")[0]}</p>
          <p className="text-gray-500 mt-3 mb-2"># Check for leaks:</p>
          <p>valgrind --leak-check=full ./{exercise.slug.replace("cpp0", "ex0").split("-")[0]}</p>
        </div>
      </div>

      {/* Common Mistakes */}
      <div className="card p-5 mb-4 border-l-4 border-l-orange-500">
        <h2 className="text-base font-bold text-orange-400 mb-3">⚠️ Common Mistakes</h2>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex gap-2">
            <span className="text-red-400">✗</span>
            Forgetting Orthodox Canonical Form (copy constructor, assignment operator, destructor)
          </li>
          <li className="flex gap-2">
            <span className="text-red-400">✗</span>
            Using forbidden functions (printf, alloc, free)
          </li>
          <li className="flex gap-2">
            <span className="text-red-400">✗</span>
            Missing include guards in header files
          </li>
          <li className="flex gap-2">
            <span className="text-red-400">✗</span>
            Implementation in header files (except templates)
          </li>
          <li className="flex gap-2">
            <span className="text-red-400">✗</span>
            Using &quot;using namespace&quot; or &quot;friend&quot; keyword
          </li>
        </ul>
      </div>

      {/* Defense Checklist Preview */}
      <div className="card p-5">
        <h2 className="text-base font-bold text-gray-100 mb-3">📋 Defense Prep Checklist</h2>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2 text-gray-400">
            <input type="checkbox" className="rounded border-gray-600" disabled />
            Compiles with -Wall -Wextra -Werror -std=c++98
          </label>
          <label className="flex items-center gap-2 text-gray-400">
            <input type="checkbox" className="rounded border-gray-600" disabled />
            Orthodox Canonical Form implemented
          </label>
          <label className="flex items-center gap-2 text-gray-400">
            <input type="checkbox" className="rounded border-gray-600" disabled />
            No memory leaks (valgrind clean)
          </label>
          <label className="flex items-center gap-2 text-gray-400">
            <input type="checkbox" className="rounded border-gray-600" disabled />
            Can explain code without looking at it
          </label>
          <label className="flex items-center gap-2 text-gray-400">
            <input type="checkbox" className="rounded border-gray-600" disabled />
            All edge cases tested
          </label>
        </div>
        <Link
          href={`/cpp/${moduleSlug}/defense`}
          className="btn-secondary text-xs mt-3 inline-block px-3 py-1.5"
        >
          Full Defense Checklist →
        </Link>
      </div>
    </div>
  );
}
