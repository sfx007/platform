import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCppModules } from "@/lib/cpp-modules";
import { prisma } from "@/lib/db";
import Link from "next/link";

interface Props {
  params: Promise<{ moduleSlug: string }>;
}

export default async function CppModulePage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { moduleSlug } = await params;
  const modules = await getCppModules(user.id);
  const mod = modules.find((m) => m.slug === moduleSlug);
  if (!mod) notFound();

  // Get skills for this module
  const skills = await prisma.cppSkill.findMany({
    where: { moduleNumber: mod.number },
    include: { userCppSkills: { where: { userId: user.id } } },
  });

  const completedCount = mod.exercises.filter(
    (ex) => ex.status === "completed" || ex.status === "defended"
  ).length;
  const pct = Math.round((completedCount / mod.exercises.length) * 100);

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
        <span className="text-gray-300">Module {String(mod.number).padStart(2, "0")}</span>
      </nav>

      {/* Module Header */}
      <div className="card p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-50 font-heading">
          Module {String(mod.number).padStart(2, "0")}: {mod.title}
        </h1>
        <p className="text-gray-400 mt-2">{mod.description}</p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-400">Progress</span>
            <span className="text-gray-300">{completedCount}/{mod.exercises.length} exercises ({pct}%)</span>
          </div>
          <div className="h-2.5 bg-gray-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <h2 className="text-lg font-bold text-gray-100 font-heading mb-4">📝 Exercises</h2>
      <div className="space-y-3 mb-8">
        {mod.exercises.map((ex) => {
          const statusColors: Record<string, string> = {
            not_started: "border-gray-700",
            in_progress: "border-yellow-600/50 border-l-4 border-l-yellow-500",
            completed: "border-green-600/50 border-l-4 border-l-green-500",
            defended: "border-blue-600/50 border-l-4 border-l-blue-500",
          };
          const statusBadges: Record<string, { text: string; className: string }> = {
            not_started: { text: "Not Started", className: "bg-gray-800 text-gray-500" },
            in_progress: { text: "In Progress", className: "bg-yellow-900/40 text-yellow-400" },
            completed: { text: "Completed", className: "bg-green-900/40 text-green-400" },
            defended: { text: "Defended", className: "bg-blue-900/40 text-blue-400" },
          };
          const diffColors: Record<string, string> = {
            easy: "text-green-400",
            medium: "text-yellow-400",
            hard: "text-red-400",
          };

          const s = ex.status ?? "not_started";
          const badge = statusBadges[s];

          return (
            <Link
              key={ex.slug}
              href={`/cpp/${moduleSlug}/${ex.slug}`}
              className={`card p-4 block hover:bg-gray-800/60 transition-colors ${statusColors[s]}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-500">
                      Ex{String(ex.number).padStart(2, "0")}
                    </span>
                    <h3 className="text-base font-bold text-gray-100">{ex.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${badge.className}`}>
                      {badge.text}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{ex.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className={diffColors[ex.difficulty]}>
                      {ex.difficulty.charAt(0).toUpperCase() + ex.difficulty.slice(1)}
                    </span>
                    <span>⏱ ~{ex.estimatedHours}h</span>
                    <span>📁 {ex.filesRequired.length} files</span>
                    {ex.defenseScore && (
                      <span className="text-blue-400">⚔️ Defense: {ex.defenseScore}/100</span>
                    )}
                  </div>
                </div>
                <span className="text-gray-600 text-xl ml-3">→</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Skills Section */}
      <h2 className="text-lg font-bold text-gray-100 font-heading mb-4">🎯 Skills Unlocked by this Module</h2>
      <div className="grid gap-3 md:grid-cols-3 mb-8">
        {skills.map((skill) => {
          const us = skill.userCppSkills[0];
          const level = us?.level ?? "locked";
          return (
            <div key={skill.slug} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{levelEmojis[level]}</span>
                <h4 className="text-sm font-bold text-gray-200">{skill.title}</h4>
              </div>
              <p className="text-xs text-gray-500 mb-2">{skill.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 capitalize">{level}</span>
                {us && <span className="text-gray-600">{us.timesUsed}x used</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Defense Prep */}
      {pct >= 75 && pct < 100 && (
        <div className="card p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚠️</span>
            <h3 className="text-sm font-bold text-orange-400">Peer Evaluation Approaching</h3>
          </div>
          <p className="text-xs text-gray-400">
            You&apos;re almost done with this module! Start preparing for your peer evaluation.
          </p>
          <Link href={`/cpp/${moduleSlug}/defense`} className="btn-secondary text-xs mt-2 inline-block px-3 py-1.5">
            📋 Defense Prep Checklist
          </Link>
        </div>
      )}
    </div>
  );
}
