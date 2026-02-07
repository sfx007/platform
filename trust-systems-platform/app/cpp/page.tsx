import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCppModules, getCppDashboard } from "@/lib/cpp-modules";
import Link from "next/link";

export default async function CppPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [modules, dashboard] = await Promise.all([
    getCppModules(user.id),
    getCppDashboard(user.id),
  ]);

  const totalExercises = 16;
  const completedExercises = dashboard.modulesProgress.reduce((sum, mp) => sum + mp.exercisesCompleted, 0);
  const overallPct = Math.round((completedExercises / totalExercises) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="card p-6 mb-6 border-l-4 border-l-yellow-400">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-50 font-heading">
              🎓 C++ Modules (05-09)
            </h1>
            <p className="text-gray-400 mt-1">
              Master C++ through 42&apos;s curriculum — exceptions, casts, templates, and the STL.
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="text-center px-4 py-2 rounded-lg bg-gray-900/60 border border-gray-700">
              <span className="block text-lg font-bold text-yellow-400">🔥 {dashboard.streak}</span>
              <span className="text-gray-500">Streak</span>
            </div>
            <div className="text-center px-4 py-2 rounded-lg bg-gray-900/60 border border-gray-700">
              <span className="block text-lg font-bold text-blue-400">🧠 {dashboard.cardsDue}</span>
              <span className="text-gray-500">Cards Due</span>
            </div>
            <div className="text-center px-4 py-2 rounded-lg bg-gray-900/60 border border-gray-700">
              <span className="block text-lg font-bold text-green-400">⚡ {dashboard.totalXp}</span>
              <span className="text-gray-500">XP</span>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-400">Overall Progress</span>
            <span className="text-gray-300 font-medium">{completedExercises}/{totalExercises} exercises ({overallPct}%)</span>
          </div>
          <div className="h-2.5 bg-gray-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Link href="/cpp/dashboard" className="card p-3 text-center hover:border-yellow-500/50 transition-colors">
          <span className="text-xl">🎯</span>
          <span className="block text-sm text-gray-300 mt-1">Daily Mission</span>
        </Link>
        <Link href="/cpp/flashcards" className="card p-3 text-center hover:border-blue-500/50 transition-colors">
          <span className="text-xl">🃏</span>
          <span className="block text-sm text-gray-300 mt-1">Flashcards ({dashboard.cardsDue} due)</span>
        </Link>
        <Link href="/cpp/skills" className="card p-3 text-center hover:border-green-500/50 transition-colors">
          <span className="text-xl">🌳</span>
          <span className="block text-sm text-gray-300 mt-1">Skills ({dashboard.skillsSummary.unlocked}/15)</span>
        </Link>
        <Link href="/cpp/achievements" className="card p-3 text-center hover:border-purple-500/50 transition-colors">
          <span className="text-xl">🏆</span>
          <span className="block text-sm text-gray-300 mt-1">Achievements ({dashboard.achievements.length})</span>
        </Link>
      </div>

      {/* Current Mission Card */}
      {dashboard.currentMission && (
        <div className="card p-5 mb-8 border-l-4 border-l-green-500">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Today&apos;s Mission</span>
              <h3 className="text-lg font-bold text-gray-100 mt-1">
                Module {dashboard.currentMission.module.number}, Ex{String(dashboard.currentMission.exercise.number).padStart(2, "0")} — {dashboard.currentMission.exercise.title}
              </h3>
              <p className="text-gray-400 text-sm mt-1">{dashboard.currentMission.exercise.description}</p>
            </div>
            <Link
              href={`/cpp/dashboard`}
              className="btn-primary px-4 py-2 text-sm whitespace-nowrap"
            >
              🎯 Start Session
            </Link>
          </div>
        </div>
      )}

      {/* Module Grid */}
      <h2 className="text-xl font-bold text-gray-100 font-heading mb-4">📚 Modules</h2>
      <div className="space-y-4">
        {modules.map((mod) => {
          const mp = dashboard.modulesProgress.find((p) => p.module.slug === mod.slug);
          const pct = mp?.pct ?? 0;
          const completed = mp?.exercisesCompleted ?? 0;
          const defended = mp?.exercisesDefended ?? 0;

          return (
            <Link key={mod.slug} href={`/cpp/${mod.slug}`} className="card p-5 block hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-100">
                    Module {String(mod.number).padStart(2, "0")}: {mod.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-0.5">{mod.description}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="text-2xl font-bold text-gray-200">{pct}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-gray-900 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: pct === 100
                      ? "linear-gradient(90deg, #22c55e, #16a34a)"
                      : "linear-gradient(90deg, #eab308, #f59e0b)",
                  }}
                />
              </div>

              {/* Exercise Pills */}
              <div className="flex flex-wrap gap-2">
                {mod.exercises.map((ex) => {
                  const statusColors: Record<string, string> = {
                    not_started: "bg-gray-800 text-gray-500 border-gray-700",
                    in_progress: "bg-yellow-900/30 text-yellow-400 border-yellow-700/50",
                    completed: "bg-green-900/30 text-green-400 border-green-700/50",
                    defended: "bg-blue-900/30 text-blue-400 border-blue-700/50",
                  };
                  const statusIcons: Record<string, string> = {
                    not_started: "○",
                    in_progress: "🔄",
                    completed: "✅",
                    defended: "⚔️",
                  };
                  const s = ex.status ?? "not_started";
                  return (
                    <span
                      key={ex.slug}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${statusColors[s]}`}
                    >
                      {statusIcons[s]} Ex{String(ex.number).padStart(2, "0")}: {ex.title}
                    </span>
                  );
                })}
              </div>

              {/* Stats Row */}
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                <span>{completed}/{mod.exercises.length} completed</span>
                {defended > 0 && <span>⚔️ {defended} defended</span>}
                <span>{mod.exercises.reduce((s, e) => s + e.estimatedHours, 0)}h estimated</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Next Milestone */}
      <div className="card p-4 mt-8 text-center">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Next Milestone</span>
        <p className="text-gray-300 mt-1">{dashboard.nextMilestone}</p>
      </div>
    </div>
  );
}
