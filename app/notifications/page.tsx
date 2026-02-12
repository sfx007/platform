"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getSessionToken } from "@/app/components/session-guard";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

function apiUrl(path: string) {
  const token = getSessionToken();
  return token ? `${path}?t=${encodeURIComponent(token)}` : path;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function typeIcon(type: string) {
  switch (type) {
    case "level_up": return "🎉";
    case "achievement": return "🏆";
    case "streak": return "🔥";
    case "lesson_complete": return "✅";
    case "quest_complete": return "⚔️";
    case "review_due": return "📝";
    case "new_message": return "💬";
    case "system": return "📢";
    default: return "🔔";
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/notifications"), { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.notifications);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function markAllRead() {
    try {
      await fetch(apiUrl("/api/notifications"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
    } catch { /* ignore */ }
  }

  async function markRead(id: string) {
    try {
      await fetch(apiUrl("/api/notifications"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    } catch { /* ignore */ }
  }

  async function deleteNotification(id: string) {
    try {
      await fetch(apiUrl("/api/notifications"), {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch { /* ignore */ }
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-6 animate-float-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-100">🔔 Notifications</h1>
          <p className="text-xs text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors px-3 py-1.5 rounded-lg border border-yellow-500/30 hover:border-yellow-500/50"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      {notifications.length === 0 ? (
        <div className="game-card p-12 text-center">
          <p className="text-3xl mb-3">🔔</p>
          <p className="text-sm text-gray-500">No notifications yet</p>
          <p className="text-xs text-gray-600 mt-1">
            You&apos;ll get notified about achievements, level ups, messages, and more!
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`game-card flex items-start gap-3 p-3 sm:p-4 transition-all ${
                !n.readAt ? "border-l-2 border-l-yellow-500 bg-yellow-500/5" : "opacity-70"
              }`}
            >
              {/* Icon */}
              <span className="text-xl mt-0.5 shrink-0">{typeIcon(n.type)}</span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${!n.readAt ? "text-gray-100" : "text-gray-400"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                  </div>
                  <span className="text-[10px] text-gray-600 shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-2">
                  {n.link && (
                    <Link
                      href={n.link}
                      className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors"
                      onClick={() => { if (!n.readAt) markRead(n.id); }}
                    >
                      View →
                    </Link>
                  )}
                  {!n.readAt && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
