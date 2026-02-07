import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCppDashboard } from "@/lib/cpp-modules";
import Link from "next/link";

export default async function CppDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dashboard = await getCppDashboard(user.id);
  const mission = dashboard.currentMission;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-float-up">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/cpp" className="hover:text-gray-300 transition-colors">C++ Modules</Link>
        <span>/</span>
        <span className="text-gray-300">Daily Mission</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <span className="inline-block px-2 py-0.5 rounded bg-orange-900/40 text-orange-300 text-xs font-medium mb-2">
          DAILY RITUAL
        </span>
        <h1 className="text-2xl font-bold text-gray-50 font-heading">Daily Mission Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your structured training session. Follow the phases to maximize learning.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card p-4 text-center">
          <span className="text-2xl font-bold text-orange-400">🔥 {dashboard.streak}</span>
          <span className="block text-xs text-gray-500 mt-1">Day Streak</span>
        </div>
        <div className="card p-4 text-center">
          <span className="text-2xl font-bold text-blue-400">📇 {dashboard.cardsDue}</span>
          <span className="block text-xs text-gray-500 mt-1">Cards Due</span>
        </div>
        <div className="card p-4 text-center">
          <span className="text-2xl font-bold text-green-400">⚡ {dashboard.totalXp}</span>
          <span className="block text-xs text-gray-500 mt-1">Total XP</span>
        </div>
        <div className="card p-4 text-center">
          <span className="text-2xl font-bold text-purple-400">🏆 {dashboard.achievements.length}</span>
          <span className="block text-xs text-gray-500 mt-1">Achievements</span>
        </div>
      </div>

      {!mission ? (
        <div className="card p-8 text-center">
          <span className="text-4xl mb-3 block">🎉</span>
          <h2 className="text-xl font-bold text-gray-100">All exercises complete!</h2>
          <p className="text-gray-400 mt-2">You&apos;ve finished all C++ modules. Keep reviewing flashcards for mastery.</p>
          <Link href="/cpp/flashcards" className="btn-primary text-sm mt-4 inline-block px-4 py-2">
            Review Flashcards →
          </Link>
        </div>
      ) : (
        <>
          {/* Current Exercise Banner */}
          <div className="card p-5 mb-6 border-l-4 border-l-blue-500">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-gray-500 font-mono">
                  Module {String(mission.module.number).padStart(2, "0")} &middot; Exercise {String(mission.exercise.number).padStart(2, "0")}
                </span>
                <h2 className="text-lg font-bold text-gray-100 mt-1">{mission.exercise.title}</h2>
                <p className="text-sm text-gray-400 mt-1">{mission.exercise.description}</p>
              </div>
              <Link
                href={`/cpp/${mission.module.slug}/${mission.exercise.slug}`}
                className="btn-primary text-xs px-3 py-1.5 shrink-0"
              >
                Open →
              </Link>
            </div>
          </div>

          {/* Mission Phases */}
          <div className="space-y-4">
            {[mission.warmup, mission.coreWork, mission.prove, mission.cooldown].map((phase, idx) => (
              <PhaseCard key={idx} phase={phase} phaseIndex={idx} />
            ))}
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-3 mt-6">
            <Link
              href="/cpp/flashcards"
              className="card p-4 text-center hover:border-blue-500/50 transition-colors"
            >
              <span className="text-2xl">📇</span>
              <span className="block text-sm text-gray-300 mt-1">Review Cards</span>
              <span className="text-xs text-gray-500">{dashboard.cardsDue} due</span>
            </Link>
            <Link
              href="/cpp/skills"
              className="card p-4 text-center hover:border-green-500/50 transition-colors"
            >
              <span className="text-2xl">🎯</span>
              <span className="block text-sm text-gray-300 mt-1">Skills</span>
              <span className="text-xs text-gray-500">{dashboard.skillsSummary.unlocked}/{dashboard.skillsSummary.total} unlocked</span>
            </Link>
            <Link
              href="/cpp/achievements"
              className="card p-4 text-center hover:border-purple-500/50 transition-colors"
            >
              <span className="text-2xl">🏆</span>
              <span className="block text-sm text-gray-300 mt-1">Achievements</span>
              <span className="text-xs text-gray-500">{dashboard.achievements.length} earned</span>
            </Link>
          </div>
        </>
      )}

      {/* Next Milestone */}
      <div className="card p-4 mt-6 text-center border-t-2 border-t-yellow-600">
        <span className="text-xs text-gray-500">NEXT MILESTONE</span>
        <p className="text-sm text-gray-300 mt-1">{dashboard.nextMilestone}</p>
      </div>
    </div>
  );
}

function PhaseCard({ phase, phaseIndex }: { phase: { label: string; duration: string; tasks: string[] }; phaseIndex: number }) {
  const colors = [
    "border-l-orange-500 bg-orange-950/10",  // warmup
    "border-l-blue-500 bg-blue-950/10",       // core
    "border-l-green-500 bg-green-950/10",     // prove
    "border-l-cyan-500 bg-cyan-950/10",       // cooldown
  ];

  return (
    <div className={`card p-5 border-l-4 ${colors[phaseIndex]}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-100 text-sm">{phase.label}</h3>
        <span className="text-xs text-gray-500 bg-gray-900 px-2 py-0.5 rounded">{phase.duration}</span>
      </div>
      <ul className="space-y-2">
        {phase.tasks.map((task, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
            <span className="text-gray-600 mt-0.5">○</span>
            <span>{task}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
