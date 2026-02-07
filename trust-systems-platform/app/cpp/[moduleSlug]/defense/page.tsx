import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

interface Props {
  params: Promise<{ moduleSlug: string }>;
}

const MODULE_CHECKLISTS: Record<number, { category: string; items: string[] }[]> = {
  5: [
    {
      category: "Exception Handling",
      items: [
        "Explain the difference between throw and try/catch",
        "Know when to use exception specifications",
        "Implement custom exception classes inheriting from std::exception",
        "Override the what() method properly",
        "Explain exception safety guarantees (basic, strong, no-throw)",
        "Demonstrate stack unwinding with exceptions",
      ],
    },
    {
      category: "Error Recovery",
      items: [
        "Handle nested try/catch blocks",
        "Explain why destructors should not throw",
        "Implement error handling without exceptions (error codes pattern)",
        "Use RAII for exception-safe resource management",
      ],
    },
  ],
  6: [
    {
      category: "Cast Types",
      items: [
        "Explain static_cast and when to use it",
        "Explain dynamic_cast and RTTI requirements",
        "Explain const_cast use cases and dangers",
        "Explain reinterpret_cast and why it's dangerous",
        "Identify correct cast for each conversion scenario",
        "Explain difference between C-style casts and C++ casts",
      ],
    },
    {
      category: "Type Identification",
      items: [
        "Use dynamic_cast for safe downcasting",
        "Handle failed dynamic_cast (null pointer / bad_cast)",
        "Explain when to use static_cast vs dynamic_cast",
        "Demonstrate upcasting vs downcasting",
      ],
    },
  ],
  7: [
    {
      category: "Function Templates",
      items: [
        "Write a function template with type parameters",
        "Explain template instantiation and specialization",
        "Handle multiple template parameters",
        "Write template functions: swap, min, max",
      ],
    },
    {
      category: "Class Templates",
      items: [
        "Implement a class template (e.g., Array<T>)",
        "Write member functions for class templates",
        "Implement iterator pattern for template containers",
        "Handle template with non-type parameters (size)",
        "Explain why templates must be in header files",
      ],
    },
  ],
  8: [
    {
      category: "STL Containers",
      items: [
        "Use std::vector, std::list, std::map",
        "Explain when to use which container",
        "Iterate using iterators and reverse iterators",
        "Understand container complexity guarantees",
      ],
    },
    {
      category: "STL Algorithms",
      items: [
        "Use std::find, std::sort, std::for_each",
        "Implement comparison functors for sorting",
        "Use std::stack and std::queue adapters",
        "Understand erase-remove idiom",
      ],
    },
  ],
  9: [
    {
      category: "Advanced Containers",
      items: [
        "Use std::set and std::multimap",
        "Implement merge operations on containers",
        "Use std::pair and std::make_pair",
        "Understand associative container requirements",
      ],
    },
    {
      category: "Advanced Algorithms",
      items: [
        "Implement custom algorithms with iterators",
        "Use range-based operations effectively",
        "Understand algorithm complexity requirements",
        "Combine multiple STL components elegantly",
      ],
    },
  ],
};

export default async function DefensePrepPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { moduleSlug } = await params;

  const cppModule = await prisma.cppModule.findUnique({
    where: { slug: moduleSlug },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: { userProgress: { where: { userId: user.id } } },
      },
    },
  });

  if (!cppModule) notFound();

  const completed = cppModule.exercises.filter(
    (ex) => ex.userProgress[0]?.status === "completed" || ex.userProgress[0]?.status === "defended"
  ).length;
  const pct = Math.round((completed / cppModule.exercises.length) * 100);
  const checklists = MODULE_CHECKLISTS[cppModule.number] ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-float-up">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/cpp" className="hover:text-gray-300 transition-colors">C++ Modules</Link>
        <span>/</span>
        <Link href={`/cpp/${moduleSlug}`} className="hover:text-gray-300 transition-colors">
          Module {String(cppModule.number).padStart(2, "0")}
        </Link>
        <span>/</span>
        <span className="text-gray-300">Defense Prep</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <span className="inline-block px-2 py-0.5 rounded bg-red-900/40 text-red-300 text-xs font-medium mb-2">
          DEFENSE PREP
        </span>
        <h1 className="text-2xl font-bold text-gray-50 font-heading">
          Module {String(cppModule.number).padStart(2, "0")} — Defense Checklist
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Prepare for peer evaluation. Make sure you can explain everything without looking at your code.
        </p>
      </div>

      {/* Readiness Score */}
      <div className="card p-5 mb-6 border-l-4 border-l-orange-500">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-300">Readiness</h2>
          <span className="text-sm font-mono text-gray-400">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct === 100
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : pct >= 75
                ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                : "linear-gradient(90deg, #ef4444, #f87171)",
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {completed}/{cppModule.exercises.length} exercises completed.
          {pct < 100 ? " Complete all exercises before defending." : " Ready for defense! 🎉"}
        </p>
      </div>

      {/* Exercise Status Overview */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-bold text-gray-300 mb-3">Exercise Status</h2>
        <div className="space-y-2">
          {cppModule.exercises.map((ex) => {
            const status = ex.userProgress[0]?.status ?? "not_started";
            const statusIcons: Record<string, string> = {
              not_started: "○",
              in_progress: "🔄",
              completed: "✅",
              defended: "⚔️",
            };
            const statusColors: Record<string, string> = {
              not_started: "text-gray-500",
              in_progress: "text-blue-400",
              completed: "text-green-400",
              defended: "text-purple-400",
            };
            return (
              <div key={ex.id} className="flex items-center gap-3">
                <span className={statusColors[status]}>{statusIcons[status]}</span>
                <Link
                  href={`/cpp/${moduleSlug}/${ex.slug}`}
                  className="text-sm text-gray-300 hover:text-gray-100 transition-colors"
                >
                  Ex{String(ex.number).padStart(2, "0")}: {ex.title}
                </Link>
                <span className={`text-xs capitalize ${statusColors[status]}`}>{status.replace("_", " ")}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checklists */}
      {checklists.map((checklist, idx) => (
        <div key={idx} className="card p-5 mb-4">
          <h2 className="text-base font-bold text-gray-100 mb-3">
            📋 {checklist.category}
          </h2>
          <div className="space-y-2">
            {checklist.items.map((item, i) => (
              <label key={i} className="flex items-start gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-600 mt-0.5"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* General Defense Tips */}
      <div className="card p-5 border-l-4 border-l-cyan-500">
        <h2 className="text-base font-bold text-cyan-400 mb-3">💡 General Defense Tips</h2>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex gap-2">
            <span className="text-cyan-500">→</span>
            Be ready to explain <strong>why</strong> you made specific design choices
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-500">→</span>
            Practice explaining code flow without looking at your screen
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-500">→</span>
            Know the difference between your approach and alternatives
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-500">→</span>
            Test edge cases: empty input, large input, invalid types
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-500">→</span>
            Compile with <code className="bg-gray-900 px-1 rounded text-xs">-Wall -Wextra -Werror -std=c++98</code> one final time
          </li>
        </ul>
      </div>
    </div>
  );
}
