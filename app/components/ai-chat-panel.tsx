"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ─── Types matching the AI monitor JSON schema ─── */
interface CoachAction {
  type: string;
  text: string;
  minutes: number;
}

interface GraduatedHint {
  level: number;
  hint: string;
}

interface CoachResponse {
  coach_mode: string;
  message: string;
  diagnosis: {
    failure_types: string[];
    confidence: number;
    evidence: string[];
  };
  next_actions: CoachAction[];
  graduated_hints: GraduatedHint[];
  flashcards_to_create: { front: string; back: string; type: string; difficulty: string }[];
  skill_updates: { skill: string; delta: number; reason: string }[];
  log_update: {
    session_summary: string;
    mistakes: string;
    what_to_do_next_time: string;
  };
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  coachData?: CoachResponse;
  timestamp: number;
}

interface AIChatPanelProps {
  lessonId?: string;
  partSlug?: string;
  lessonTitle?: string;
  getCode?: () => string;
  getTerminalOutput?: () => string;
}

const MODE_LABELS: Record<string, { icon: string; label: string; color: string }> = {
  warmup: { icon: "🌅", label: "Warmup", color: "text-orange-400" },
  work: { icon: "⚒️", label: "Work", color: "text-blue-400" },
  prove: { icon: "✅", label: "Prove", color: "text-green-400" },
  ship: { icon: "🚀", label: "Ship", color: "text-purple-400" },
  debug: { icon: "🔍", label: "Debug", color: "text-red-400" },
};

export default function AIChatPanel({
  lessonId,
  partSlug,
  lessonTitle,
  getCode,
  getTerminalOutput,
}: AIChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState<Record<number, number>>({});
  const [activeTab, setActiveTab] = useState<"chat" | "actions" | "log">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.role === "assistant" && m.coachData
          ? m.coachData.message
          : m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          lessonId,
          partSlug,
          code: getCode?.()?.slice(0, 8000),
          terminalOutput: getTerminalOutput?.()?.slice(0, 3000),
          history,
        }),
      });

      const data = await res.json();

      if (data.success && data.response) {
        const coachData = data.response as CoachResponse;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: coachData.message,
            coachData,
            timestamp: Date.now(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Sorry, I couldn't process that. Try again.",
            timestamp: Date.now(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connection error. Check your internet and try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, lessonId, partSlug, getCode, getTerminalOutput]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const revealNextHint = (msgIdx: number, maxLevel: number) => {
    setHintsRevealed((prev) => ({
      ...prev,
      [msgIdx]: Math.min((prev[msgIdx] || 0) + 1, maxLevel),
    }));
  };

  const lastCoach = [...messages].reverse().find((m) => m.coachData)?.coachData;

  // Quick action buttons
  const quickActions = [
    { label: "🌅 Start Session", msg: "Start my session. What should I warm up with today?" },
    { label: "🔍 Review My Code", msg: "Review my current code. What should I fix?" },
    { label: "🐛 I'm Stuck", msg: "I'm stuck. Give me a hint without the answer." },
    { label: "✅ Check My Proof", msg: "Check my proof. Does it meet the pass criteria?" },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all hover:scale-105 flex items-center justify-center text-2xl"
        title="AI Monitor"
      >
        🤖
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-850 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <div className="text-sm font-bold text-white">AI Monitor</div>
            {lastCoach && (
              <div className={`text-[10px] font-semibold ${MODE_LABELS[lastCoach.coach_mode]?.color || "text-gray-400"}`}>
                {MODE_LABELS[lastCoach.coach_mode]?.icon} {MODE_LABELS[lastCoach.coach_mode]?.label || lastCoach.coach_mode} Mode
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Tab switches */}
          {(["chat", "actions", "log"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${
                activeTab === tab
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab === "chat" ? "💬" : tab === "actions" ? "📋" : "📝"}
            </button>
          ))}
          <button
            onClick={() => setIsOpen(false)}
            className="ml-2 text-gray-500 hover:text-white transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Tab: Actions Panel ── */}
      {activeTab === "actions" && lastCoach && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Diagnosis */}
          {lastCoach.diagnosis.failure_types.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="text-xs font-bold text-red-400 mb-2">🔍 Diagnosis</div>
              <div className="flex flex-wrap gap-1 mb-2">
                {lastCoach.diagnosis.failure_types.map((ft, i) => (
                  <span key={i} className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded text-[10px] font-semibold">
                    {ft}
                  </span>
                ))}
              </div>
              <div className="text-[10px] text-gray-400">
                Confidence: {Math.round(lastCoach.diagnosis.confidence * 100)}%
              </div>
              {lastCoach.diagnosis.evidence.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {lastCoach.diagnosis.evidence.map((e, i) => (
                    <li key={i} className="text-xs text-gray-300">• {e}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Next Actions */}
          {lastCoach.next_actions.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="text-xs font-bold text-blue-400 mb-2">📋 Next Actions</div>
              <div className="space-y-2">
                {lastCoach.next_actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs mt-0.5">
                      {action.type === "do" ? "⚒️" : action.type === "prove" ? "✅" : action.type === "reflect" ? "💭" : action.type === "experiment" ? "🧪" : "▸"}
                    </span>
                    <div className="flex-1">
                      <div className="text-xs text-gray-200">{action.text}</div>
                      <div className="text-[10px] text-gray-500">{action.minutes} min</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Updates */}
          {lastCoach.skill_updates.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="text-xs font-bold text-green-400 mb-2">⚡ Skill Updates</div>
              {lastCoach.skill_updates.map((su, i) => (
                <div key={i} className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-300 font-mono">{su.skill}</span>
                  <span className={su.delta > 0 ? "text-green-400" : "text-red-400"}>
                    {su.delta > 0 ? "+" : ""}{su.delta}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Flashcards Created */}
          {lastCoach.flashcards_to_create.length > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <div className="text-xs font-bold text-purple-400 mb-2">
                🃏 {lastCoach.flashcards_to_create.length} Flashcard{lastCoach.flashcards_to_create.length > 1 ? "s" : ""} Created
              </div>
              {lastCoach.flashcards_to_create.map((fc, i) => (
                <div key={i} className="mb-2 last:mb-0">
                  <div className="text-xs text-gray-300 font-semibold">{fc.front}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{fc.back}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Log Panel ── */}
      {activeTab === "log" && lastCoach && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {lastCoach.log_update.session_summary && (
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs font-bold text-yellow-400 mb-2">📝 Session Summary</div>
              <div className="text-xs text-gray-300 leading-relaxed">{lastCoach.log_update.session_summary}</div>
            </div>
          )}
          {lastCoach.log_update.mistakes && (
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs font-bold text-red-400 mb-2">❌ Mistakes</div>
              <div className="text-xs text-gray-300 whitespace-pre-wrap">{lastCoach.log_update.mistakes}</div>
            </div>
          )}
          {lastCoach.log_update.what_to_do_next_time && (
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs font-bold text-green-400 mb-2">✅ Next Time</div>
              <div className="text-xs text-gray-300 whitespace-pre-wrap">{lastCoach.log_update.what_to_do_next_time}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Chat Messages ── */}
      {activeTab === "chat" && (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🤖</div>
              <div className="text-sm font-bold text-white mb-1">AI Monitor Ready</div>
              <div className="text-xs text-gray-400 mb-4 max-w-[280px] mx-auto">
                {lessonTitle
                  ? `I'm tracking your progress on "${lessonTitle}". Ask me anything.`
                  : "I'm your learning coach. Ask me anything about your current lesson."}
              </div>
              <div className="space-y-2">
                {quickActions.map((qa, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(qa.msg)}
                    className="block w-full text-left px-3 py-2 text-xs bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 ${
                  msg.role === "user"
                    ? "bg-yellow-500/20 text-yellow-100 rounded-br-sm"
                    : "bg-gray-800 text-gray-200 rounded-bl-sm"
                }`}
              >
                {/* Coach mode badge */}
                {msg.coachData && (
                  <div className={`text-[10px] font-bold mb-1 ${MODE_LABELS[msg.coachData.coach_mode]?.color || "text-gray-400"}`}>
                    {MODE_LABELS[msg.coachData.coach_mode]?.icon} {MODE_LABELS[msg.coachData.coach_mode]?.label}
                  </div>
                )}

                {/* Message text */}
                <div className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</div>

                {/* Graduated hints */}
                {msg.coachData && msg.coachData.graduated_hints.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="text-[10px] text-gray-500 font-bold mb-1">💡 Hints</div>
                    {msg.coachData.graduated_hints.map((h, hi) => {
                      const revealed = hintsRevealed[idx] || 0;
                      if (h.level > revealed) return null;
                      return (
                        <div key={hi} className="text-[11px] text-yellow-200/80 mb-1 pl-2 border-l-2 border-yellow-500/30">
                          Level {h.level}: {h.hint}
                        </div>
                      );
                    })}
                    {(hintsRevealed[idx] || 0) < msg.coachData.graduated_hints.length && (
                      <button
                        onClick={() => revealNextHint(idx, msg.coachData!.graduated_hints.length)}
                        className="text-[10px] text-yellow-500 hover:text-yellow-400 mt-1 font-semibold"
                      >
                        Reveal hint {(hintsRevealed[idx] || 0) + 1} of {msg.coachData.graduated_hints.length}
                      </button>
                    )}
                  </div>
                )}

                {/* Quick stats for coach messages */}
                {msg.coachData && (
                  <div className="flex items-center gap-2 mt-2 pt-1 border-t border-gray-700/50">
                    {msg.coachData.flashcards_to_create.length > 0 && (
                      <span className="text-[9px] text-purple-400">
                        🃏 {msg.coachData.flashcards_to_create.length} cards
                      </span>
                    )}
                    {msg.coachData.skill_updates.length > 0 && (
                      <span className="text-[9px] text-green-400">
                        ⚡ {msg.coachData.skill_updates.length} skills
                      </span>
                    )}
                    {msg.coachData.next_actions.length > 0 && (
                      <button
                        onClick={() => setActiveTab("actions")}
                        className="text-[9px] text-blue-400 hover:text-blue-300"
                      >
                        📋 {msg.coachData.next_actions.length} actions →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-xl px-3 py-2 rounded-bl-sm">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Input area ── */}
      <div className="border-t border-gray-700 p-3 shrink-0 bg-gray-850">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach..."
            rows={1}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 resize-none focus:outline-none focus:border-yellow-500/50 max-h-20"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold text-xs rounded-lg transition-colors shrink-0"
          >
            {loading ? "..." : "→"}
          </button>
        </div>
      </div>
    </div>
  );
}
