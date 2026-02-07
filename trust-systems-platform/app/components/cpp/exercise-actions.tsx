"use client";

import { useState, useTransition } from "react";

interface Props {
  slug: string;
  status: string;
  gitRepoLink: string;
  notes: string;
  defenseScore?: number;
}

export default function ExerciseActions({
  slug,
  status: initialStatus,
  gitRepoLink: initialGit,
  notes: initialNotes,
  defenseScore: initialDefense,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [gitRepoLink, setGitRepoLink] = useState(initialGit);
  const [notes, setNotes] = useState(initialNotes);
  const [defenseScore, setDefenseScore] = useState(initialDefense?.toString() ?? "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  async function save(nextStatus?: string) {
    startTransition(async () => {
      try {
        const body: Record<string, unknown> = { slug, gitRepoLink, notes };
        if (nextStatus) body.status = nextStatus;
        if (defenseScore) body.defenseScore = parseInt(defenseScore, 10);

        const res = await fetch("/api/cpp/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error("Save failed");
        const data = await res.json();
        setStatus(data.status ?? nextStatus ?? status);
        setMessage("✅ Saved!");
        setTimeout(() => setMessage(""), 2000);
      } catch {
        setMessage("❌ Error saving");
      }
    });
  }

  const statusColors: Record<string, string> = {
    not_started: "border-gray-700 bg-gray-800",
    in_progress: "border-blue-600 bg-blue-900/30",
    completed: "border-green-600 bg-green-900/30",
    defended: "border-purple-600 bg-purple-900/30",
  };

  const statusEmojis: Record<string, string> = {
    not_started: "○",
    in_progress: "🔄",
    completed: "✅",
    defended: "⚔️",
  };

  return (
    <div className={`card p-5 mb-4 border-l-4 ${statusColors[status] ?? statusColors.not_started}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-100">
          {statusEmojis[status]} Status: <span className="capitalize">{status.replace("_", " ")}</span>
        </h2>
        {message && (
          <span className="text-sm text-green-400 animate-fade-in">{message}</span>
        )}
      </div>

      {/* Git Repo Link */}
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Git Repository</label>
        <input
          type="text"
          value={gitRepoLink}
          onChange={(e) => setGitRepoLink(e.target.value)}
          placeholder="https://github.com/user/cpp-module-XX"
          className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Notes */}
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Notes & Learnings</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="What did you learn? Any tricky parts?"
          className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none resize-none"
        />
      </div>

      {/* Defense Score (only when completed or defended) */}
      {(status === "completed" || status === "defended") && (
        <div className="mb-3">
          <label className="block text-xs text-gray-500 mb-1">Defense Score (0–125)</label>
          <input
            type="number"
            min="0"
            max="125"
            value={defenseScore}
            onChange={(e) => setDefenseScore(e.target.value)}
            className="w-32 rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-4">
        {status === "not_started" && (
          <button
            onClick={() => save("in_progress")}
            disabled={isPending}
            className="btn-primary text-sm px-4 py-2"
          >
            {isPending ? "Saving…" : "🚀 Start Exercise"}
          </button>
        )}
        {status === "in_progress" && (
          <>
            <button
              onClick={() => save("completed")}
              disabled={isPending}
              className="btn-primary text-sm px-4 py-2"
            >
              {isPending ? "Saving…" : "✅ Mark Complete"}
            </button>
            <button
              onClick={() => save()}
              disabled={isPending}
              className="btn-secondary text-sm px-4 py-2"
            >
              {isPending ? "Saving…" : "💾 Save Progress"}
            </button>
          </>
        )}
        {status === "completed" && (
          <button
            onClick={() => save("defended")}
            disabled={isPending}
            className="btn-primary text-sm px-4 py-2"
          >
            {isPending ? "Saving…" : "⚔️ Mark Defended"}
          </button>
        )}
        {status === "defended" && (
          <button
            onClick={() => save()}
            disabled={isPending}
            className="btn-secondary text-sm px-4 py-2"
          >
            {isPending ? "Saving…" : "💾 Update Notes"}
          </button>
        )}
      </div>
    </div>
  );
}
