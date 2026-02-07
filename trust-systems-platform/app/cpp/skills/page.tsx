import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function CppSkillsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const skills = await prisma.cppSkill.findMany({
    orderBy: [{ moduleNumber: "asc" }, { order: "asc" }],
    include: { userCppSkills: { where: { userId: user.id } } },
  });

  // Group by module
  const grouped = new Map<number, typeof skills>();
  for (const skill of skills) {
    const arr = grouped.get(skill.moduleNumber) ?? [];
    arr.push(skill);
    grouped.set(skill.moduleNumber, arr);
  }

  const moduleNames: Record<number, string> = {
    5: "Exceptions & Errors",
    6: "C++ Casts",
    7: "Templates",
    8: "STL Basics",
    9: "Advanced STL",
  };

  const levelEmojis: Record<string, string> = {
    locked: "🔒",
    unlocked: "🔓",
    bronze: "🥉",
    silver: "🥈",
    gold: "🥇",
    platinum: "💎",
  };

  const levelColors: Record<string, string> = {
    locked: "border-gray-700 bg-gray-900/50",
    unlocked: "border-gray-600 bg-gray-800/50",
    bronze: "border-amber-700 bg-amber-900/20",
    silver: "border-gray-400 bg-gray-700/20",
    gold: "border-yellow-500 bg-yellow-900/20",
    platinum: "border-cyan-400 bg-cyan-900/20",
  };

  // Stats
  const totalSkills = skills.length;
  const unlocked = skills.filter((s) => s.userCppSkills[0]?.level && s.userCppSkills[0].level !== "locked").length;
  const bronze = skills.filter((s) => s.userCppSkills[0]?.level === "bronze").length;
  const silver = skills.filter((s) => s.userCppSkills[0]?.level === "silver").length;
  const gold = skills.filter((s) => s.userCppSkills[0]?.level === "gold").length;
  const platinum = skills.filter((s) => s.userCppSkills[0]?.level === "platinum").length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-float-up">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/cpp" className="hover:text-gray-300 transition-colors">C++ Modules</Link>
        <span>/</span>
        <span className="text-gray-300">Skills</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <span className="inline-block px-2 py-0.5 rounded bg-green-900/40 text-green-300 text-xs font-medium mb-2">
          SKILL MASTERY
        </span>
        <h1 className="text-2xl font-bold text-gray-50 font-heading">C++ Skills</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your mastery across all C++ concepts. Skills level up as you complete exercises and practice.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        <div className="card p-3 text-center">
          <span className="text-lg font-bold text-gray-300">{totalSkills}</span>
          <span className="block text-xs text-gray-500">Total</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-lg font-bold text-gray-400">{unlocked}</span>
          <span className="block text-xs text-gray-500">🔓 Unlocked</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-lg font-bold text-amber-400">{bronze}</span>
          <span className="block text-xs text-gray-500">🥉 Bronze</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-lg font-bold text-gray-300">{silver}</span>
          <span className="block text-xs text-gray-500">🥈 Silver</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-lg font-bold text-yellow-400">{gold}</span>
          <span className="block text-xs text-gray-500">🥇 Gold</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-lg font-bold text-cyan-400">{platinum}</span>
          <span className="block text-xs text-gray-500">💎 Platinum</span>
        </div>
      </div>

      {/* Skills by Module */}
      {Array.from(grouped.entries()).map(([moduleNum, moduleSkills]) => (
        <div key={moduleNum} className="mb-6">
          <h2 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
            <span className="font-mono bg-gray-900 px-2 py-0.5 rounded text-xs">CPP{String(moduleNum).padStart(2, "0")}</span>
            {moduleNames[moduleNum]}
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {moduleSkills.map((skill) => {
              const us = skill.userCppSkills[0];
              const level = us?.level ?? "locked";
              const timesUsed = us?.timesUsed ?? 0;

              // Progress to next level
              const thresholds = { unlocked: 3, bronze: 10, silver: 25, gold: 50, platinum: Infinity };
              const nextThreshold = thresholds[level as keyof typeof thresholds] ?? 0;
              const progressPct = nextThreshold < Infinity ? Math.min(100, Math.round((timesUsed / nextThreshold) * 100)) : 100;

              return (
                <div
                  key={skill.slug}
                  className={`card p-4 border ${levelColors[level]} transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-200">{skill.title}</h3>
                      <span className="text-xs text-gray-500 capitalize">{skill.category}</span>
                    </div>
                    <span className="text-xl">{levelEmojis[level]}</span>
                  </div>

                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{skill.proofCriteria}</p>

                  {/* Progress bar */}
                  {level !== "locked" && level !== "platinum" && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                        <span>{timesUsed} uses</span>
                        <span>{nextThreshold < Infinity ? `${nextThreshold} to next` : ""}</span>
                      </div>
                      <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {level === "locked" && (
                    <p className="text-xs text-gray-600 mt-2 italic">
                      Complete {skill.unlockExercise} to unlock
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
