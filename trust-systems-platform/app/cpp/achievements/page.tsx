import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCppDashboard } from "@/lib/cpp-modules";
import { prisma } from "@/lib/db";
import Link from "next/link";

const ALL_ACHIEVEMENTS = [
  { key: "Exception Master", emoji: "🛡️", desc: "Complete all Module 05 exercises", module: 5 },
  { key: "Cast Wizard", emoji: "🪄", desc: "Complete all Module 06 exercises", module: 6 },
  { key: "Template Guru", emoji: "📐", desc: "Complete all Module 07 exercises", module: 7 },
  { key: "STL Architect", emoji: "🏗️", desc: "Complete all Module 08 exercises", module: 8 },
  { key: "STL Master", emoji: "🧙", desc: "Complete all Module 09 exercises", module: 9 },
  { key: "C++98 Graduate", emoji: "🎓", desc: "Complete all 5 modules", module: null },
  { key: "Bronze Collector", emoji: "🥉", desc: "Reach Bronze in 8+ skills", module: null },
  { key: "Silver Specialist", emoji: "🥈", desc: "Reach Silver in 5+ skills", module: null },
  { key: "First Defense", emoji: "⚔️", desc: "Defend your first exercise", module: null },
  { key: "Full Defense", emoji: "🏰", desc: "Defend all 15 exercises", module: null },
  { key: "Speed Runner", emoji: "⚡", desc: "Complete a module in under 3 days", module: null },
  { key: "Flashcard Sensei", emoji: "🧠", desc: "Master 50+ flashcards", module: null },
  { key: "Streak Hero", emoji: "🔥", desc: "Maintain a 7-day streak", module: null },
];

export default async function CppAchievementsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dashboard = await getCppDashboard(user.id);
  const earned = new Set(dashboard.achievements);

  // Extra stats for display
  const totalDefended = await prisma.userCppExercise.count({
    where: { userId: user.id, status: "defended" },
  });
  const totalCompleted = await prisma.userCppExercise.count({
    where: { userId: user.id, status: { in: ["completed", "defended"] } },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-float-up">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/cpp" className="hover:text-gray-300 transition-colors">C++ Modules</Link>
        <span>/</span>
        <span className="text-gray-300">Achievements</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <span className="inline-block px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 text-xs font-medium mb-2">
          ACHIEVEMENTS
        </span>
        <h1 className="text-2xl font-bold text-gray-50 font-heading">C++ Achievements</h1>
        <p className="text-sm text-gray-500 mt-1">
          Earn badges as you progress through the C++ modules. {earned.size}/{ALL_ACHIEVEMENTS.length} unlocked.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <span className="text-2xl font-bold text-purple-400">{earned.size}</span>
          <span className="block text-xs text-gray-500 mt-1">Achievements Earned</span>
        </div>
        <div className="card p-4 text-center">
          <span className="text-2xl font-bold text-green-400">{totalCompleted}</span>
          <span className="block text-xs text-gray-500 mt-1">Exercises Completed</span>
        </div>
        <div className="card p-4 text-center">
          <span className="text-2xl font-bold text-orange-400">{totalDefended}</span>
          <span className="block text-xs text-gray-500 mt-1">Exercises Defended</span>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid md:grid-cols-2 gap-3">
        {ALL_ACHIEVEMENTS.map((ach) => {
          const isEarned = earned.has(ach.key);
          return (
            <div
              key={ach.key}
              className={`card p-4 flex items-center gap-4 transition-all ${
                isEarned
                  ? "border-purple-600 bg-purple-900/15"
                  : "opacity-50 grayscale"
              }`}
            >
              <span className="text-3xl">{ach.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-bold ${isEarned ? "text-gray-100" : "text-gray-500"}`}>
                  {ach.key}
                </h3>
                <p className="text-xs text-gray-500">{ach.desc}</p>
                {ach.module && (
                  <span className="text-xs text-gray-600 font-mono">Module {String(ach.module).padStart(2, "0")}</span>
                )}
              </div>
              {isEarned && (
                <span className="text-green-400 text-sm">✅</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Next Milestone */}
      <div className="card p-4 mt-6 text-center border-t-2 border-t-yellow-600">
        <span className="text-xs text-gray-500">NEXT MILESTONE</span>
        <p className="text-sm text-gray-300 mt-1">{dashboard.nextMilestone}</p>
      </div>
    </div>
  );
}
