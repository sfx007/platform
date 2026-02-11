"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Avatar from "@/app/components/avatar";
import { getSessionToken } from "@/app/components/session-guard";

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  level: number;
  xp: number;
  streak: number;
  longestStreak: number;
  rank: number;
  totalUsers: number;
  joinedAt: string;
  lastActiveAt: string;
}

interface ProfileStats {
  lessonsCompleted: number;
  questsCompleted: number;
  partsCompleted: number;
  totalCompleted: number;
  totalLessons: number;
  totalQuests: number;
  totalParts: number;
  submissions: number;
  passRate: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earnedAt: string;
}

interface ActivityDay {
  date: string;
  count: number;
}

function rankName(level: number): string {
  if (level >= 100) return "Archmage";
  if (level >= 80) return "Mage";
  if (level >= 60) return "Archsage";
  if (level >= 50) return "Scholar";
  if (level >= 40) return "Sage";
  if (level >= 30) return "Disciple";
  if (level >= 20) return "Pupil";
  if (level >= 10) return "Acolyte";
  if (level >= 5) return "Apprentice";
  return "Novice";
}

function isOnline(lastActive: string) {
  return Date.now() - new Date(lastActive).getTime() < 5 * 60_000;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [activityDays, setActivityDays] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = getSessionToken();
    if (token) {
      fetch(`/api/auth/me?t=${encodeURIComponent(token)}`, { credentials: "include" })
        .then((r) => r.json())
        .then((d) => { if (d?.user?.id) setCurrentUserId(d.user.id); })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(username)}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setStats(data.stats);
        setBadges(data.badges);
        setActivityDays(data.activityDays);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  if (loading) {
    return (
      <div className="px-3 sm:px-6 py-8 max-w-4xl mx-auto animate-pulse">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-gray-700" />
          <div className="space-y-2">
            <div className="w-40 h-5 bg-gray-700 rounded" />
            <div className="w-24 h-3 bg-gray-700 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-700/30 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="px-3 sm:px-6 py-16 max-w-4xl mx-auto text-center">
        <p className="text-4xl mb-4">👤</p>
        <h1 className="text-xl font-bold text-gray-300 mb-2">User Not Found</h1>
        <p className="text-sm text-gray-500 mb-6">The user &quot;{username}&quot; doesn&apos;t exist.</p>
        <Link href="/community" className="btn-primary">Back to Community</Link>
      </div>
    );
  }

  const isMe = currentUserId === user.id;
  const online = isOnline(user.lastActiveAt);
  const xpPerLevel = 500;
  const xpInLevel = user.xp % xpPerLevel;
  const levelPct = Math.max(0, Math.min(100, (xpInLevel / xpPerLevel) * 100));

  // Activity heatmap — last 16 weeks (simplified)
  const today = new Date();
  const weeksToShow = 16;
  const heatmapDays: { date: string; count: number; dayOfWeek: number }[] = [];
  for (let i = weeksToShow * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const activity = activityDays.find((a) => a.date === dateStr);
    heatmapDays.push({ date: dateStr, count: activity?.count || 0, dayOfWeek: d.getDay() });
  }

  function heatColor(count: number) {
    if (count === 0) return "bg-gray-800";
    if (count <= 2) return "bg-green-900/60";
    if (count <= 5) return "bg-green-700/70";
    if (count <= 10) return "bg-green-500/80";
    return "bg-green-400";
  }

  return (
    <div className="px-3 sm:px-6 py-4 sm:py-6 max-w-4xl mx-auto animate-float-up">
      {/* ── Profile header ── */}
      <div className="game-card p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-gray-700">
              <Avatar src={user.avatarUrl} alt={user.displayName} size={96} className="w-full h-full" />
            </div>
            {online && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
            )}
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100 truncate">{user.displayName}</h1>
            <p className="text-sm text-gray-500 mb-1">@{user.username}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-gray-400 mb-2">
              <span className="badge badge-yellow">{rankName(user.level)}</span>
              <span>Level {user.level}</span>
              <span>·</span>
              <span>Rank #{user.rank} of {user.totalUsers}</span>
              <span>·</span>
              <span>{online ? <span className="text-green-400">🟢 Online</span> : `Last seen ${formatDate(user.lastActiveAt)}`}</span>
            </div>
            {user.bio && <p className="text-sm text-gray-400 max-w-lg">{user.bio}</p>}

            {/* XP bar */}
            <div className="mt-3 max-w-xs mx-auto sm:mx-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-500 font-semibold">Level {user.level}</span>
                <span className="text-[10px] text-yellow-400 font-semibold">{xpInLevel}/{xpPerLevel} XP</span>
              </div>
              <div className="h-[6px] rounded-full bg-gray-800 border border-gray-700 overflow-hidden">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#efbb03_0%,#f6bd45_100%)]" style={{ width: `${levelPct}%` }} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 shrink-0">
            {isMe ? (
              <Link href="/profile" className="px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
                Edit Profile
              </Link>
            ) : (
              <Link
                href={`/messages?user=${encodeURIComponent(user.username)}`}
                className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-sm text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                Message
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total XP", value: user.xp.toLocaleString(), icon: "⚡" },
            { label: "Current Streak", value: `${user.streak}d`, icon: "🔥" },
            { label: "Longest Streak", value: `${user.longestStreak}d`, icon: "🏆" },
            { label: "Pass Rate", value: `${stats.passRate}%`, icon: "✅" },
          ].map((s) => (
            <div key={s.label} className="game-card p-4 text-center">
              <span className="text-lg">{s.icon}</span>
              <p className="text-lg sm:text-xl font-bold text-gray-200 mt-1">{s.value}</p>
              <p className="text-[11px] text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Progress ── */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: "Lessons", done: stats.lessonsCompleted, total: stats.totalLessons, color: "text-blue-400" },
            { label: "Quests", done: stats.questsCompleted, total: stats.totalQuests, color: "text-purple-400" },
            { label: "Parts", done: stats.partsCompleted, total: stats.totalParts, color: "text-green-400" },
          ].map((p) => {
            const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
            return (
              <div key={p.label} className="game-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">{p.label}</span>
                  <span className={`text-xs font-bold ${p.color}`}>{p.done}/{p.total}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-800 border border-gray-700 overflow-hidden">
                  <div className={`h-full rounded-full ${p.color === "text-blue-400" ? "bg-blue-500" : p.color === "text-purple-400" ? "bg-purple-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-gray-600 mt-1">{pct}% complete</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Activity heatmap ── */}
      <div className="game-card p-4 sm:p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Activity (last {weeksToShow} weeks)</h2>
        <div className="overflow-x-auto">
          <div className="inline-grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${weeksToShow}, 1fr)`, gridTemplateRows: "repeat(7, 1fr)" }}>
            {(() => {
              // Group by weeks (columns)
              const cells: React.ReactNode[] = [];
              for (let col = 0; col < weeksToShow; col++) {
                for (let row = 0; row < 7; row++) {
                  const idx = col * 7 + row;
                  const day = heatmapDays[idx];
                  if (!day) {
                    cells.push(<div key={`${col}-${row}`} className="w-3 h-3 rounded-sm bg-gray-800/40" />);
                  } else {
                    cells.push(
                      <div
                        key={day.date}
                        className={`w-3 h-3 rounded-sm ${heatColor(day.count)}`}
                        title={`${day.date}: ${day.count} activit${day.count === 1 ? "y" : "ies"}`}
                      />
                    );
                  }
                }
              }
              return cells;
            })()}
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-600">
          <span>Less</span>
          {[0, 1, 3, 6, 11].map((c) => (
            <div key={c} className={`w-3 h-3 rounded-sm ${heatColor(c)}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* ── Badges ── */}
      {badges.length > 0 && (
        <div className="game-card p-4 sm:p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Badges ({badges.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {badges.map((b) => (
              <div key={b.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <span className="text-2xl shrink-0">{b.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-300 truncate">{b.name}</p>
                  <p className="text-[10px] text-gray-600 truncate">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Joined info ── */}
      <div className="text-center text-xs text-gray-600 pb-6">
        Joined {formatDate(user.joinedAt)} · {stats?.submissions || 0} total submissions
      </div>
    </div>
  );
}
