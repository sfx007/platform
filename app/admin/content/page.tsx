"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getSessionToken } from "@/app/components/session-guard";

interface Lesson {
  id: string;
  slug: string;
  title: string;
  order: number;
  durationMinutes: number;
}

interface Quest {
  id: string;
  slug: string;
  title: string;
}

interface PartSummary {
  id: string;
  slug: string;
  title: string;
  order: number;
  _count: { lessons: number };
}

interface PartFull {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  quest: Quest | null;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  published: boolean;
  parts: PartSummary[];
}

type Tab = "courses" | "parts";

function apiUrl(path: string) {
  const token = getSessionToken();
  return token ? `${path}?t=${encodeURIComponent(token)}` : path;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [unassigned, setUnassigned] = useState<PartSummary[]>([]);
  const [parts, setParts] = useState<PartFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Course form
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [cSlug, setCSlug] = useState("");
  const [cTitle, setCTitle] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cIcon, setCIcon] = useState("📚");
  const [cOrder, setCOrder] = useState("");
  const [creatingCourse, setCreatingCourse] = useState(false);

  // Part form
  const [showCreatePart, setShowCreatePart] = useState(false);
  const [pSlug, setPSlug] = useState("");
  const [pTitle, setPTitle] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pOrder, setPOrder] = useState("");
  const [creatingPart, setCreatingPart] = useState(false);

  // Expanded / delete states
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [expandedPart, setExpandedPart] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Assign part modal
  const [assigningCourseId, setAssigningCourseId] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/admin/courses"), { credentials: "include" });
      if (!res.ok) {
        if (res.status === 403) { setError("Access denied — admin only"); return; }
        throw new Error("Failed to fetch courses");
      }
      const json = await res.json();
      setCourses(json.courses || []);
      setUnassigned(json.unassigned || []);
    } catch {
      setError("Failed to load courses");
    }
  }, []);

  const fetchParts = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/admin/parts"), { credentials: "include" });
      if (!res.ok) {
        if (res.status === 403) { setError("Access denied — admin only"); return; }
        throw new Error("Failed to fetch parts");
      }
      const json = await res.json();
      setParts(json.parts || []);
    } catch {
      setError("Failed to load parts");
    }
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchParts()]);
      setLoading(false);
    }
    load();
  }, [fetchCourses, fetchParts]);

  /* --- Course CRUD --- */
  const createCourse = async () => {
    if (!cSlug || !cTitle) return;
    setCreatingCourse(true);
    try {
      const res = await fetch(apiUrl("/api/admin/courses"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: cSlug, title: cTitle, description: cDesc, icon: cIcon, order: Number(cOrder) || courses.length + 1 }),
      });
      if (!res.ok) { const j = await res.json(); setError(j.error || "Failed"); return; }
      setCSlug(""); setCTitle(""); setCDesc(""); setCIcon("📚"); setCOrder("");
      setShowCreateCourse(false);
      fetchCourses();
    } catch {
      setError("Failed to create course");
    } finally {
      setCreatingCourse(false);
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      await fetch(apiUrl(`/api/admin/courses/${id}`), { method: "DELETE", credentials: "include" });
      setDeleteConfirm(null);
      fetchCourses();
    } catch {
      setError("Failed to delete course");
    }
  };

  const assignPart = async (courseId: string, partId: string) => {
    try {
      await fetch(apiUrl(`/api/admin/courses/${courseId}/parts`), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partId }),
      });
      setAssigningCourseId(null);
      fetchCourses();
    } catch {
      setError("Failed to assign part");
    }
  };

  const unassignPart = async (courseId: string, partId: string) => {
    try {
      await fetch(apiUrl(`/api/admin/courses/${courseId}/parts`), {
        method: "DELETE", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partId }),
      });
      fetchCourses();
    } catch {
      setError("Failed to unassign part");
    }
  };

  /* --- Part CRUD --- */
  const createPart = async () => {
    if (!pSlug || !pTitle || !pOrder) return;
    setCreatingPart(true);
    try {
      const res = await fetch(apiUrl("/api/admin/parts"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: pSlug, title: pTitle, description: pDesc, order: Number(pOrder) }),
      });
      if (!res.ok) { const j = await res.json(); setError(j.error || "Failed"); return; }
      setPSlug(""); setPTitle(""); setPDesc(""); setPOrder("");
      setShowCreatePart(false);
      fetchParts();
      fetchCourses();
    } catch {
      setError("Failed to create part");
    } finally {
      setCreatingPart(false);
    }
  };

  const deletePart = async (partId: string) => {
    try {
      await fetch(apiUrl(`/api/admin/parts/${partId}`), { method: "DELETE", credentials: "include" });
      setDeleteConfirm(null);
      fetchParts();
      fetchCourses();
    } catch {
      setError("Failed to delete part");
    }
  };

  /* --- Render --- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">Loading content...</div>
      </div>
    );
  }

  if (error === "Access denied — admin only") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-200 mb-2">Admin Access Required</h2>
          <p className="text-gray-400">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const totalLessons = parts.reduce((s, p) => s + p.lessons.length, 0);
  const totalQuests = parts.filter(p => p.quest).length;

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <span className="text-3xl">⚙️</span> Content Management
          </h1>
          <p className="text-gray-400 mt-1">Manage courses, paths, lessons, and quests</p>
        </div>
      </div>

      {error && error !== "Access denied — admin only" && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 mb-6 text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-200">✕</button>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="game-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{courses.length}</div>
          <div className="text-sm text-gray-400">Courses</div>
        </div>
        <div className="game-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{parts.length}</div>
          <div className="text-sm text-gray-400">Parts</div>
        </div>
        <div className="game-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{totalLessons}</div>
          <div className="text-sm text-gray-400">Lessons</div>
        </div>
        <div className="game-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{totalQuests}</div>
          <div className="text-sm text-gray-400">Quests</div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-gray-800/50 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setTab("courses")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "courses" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
        >
          📚 Courses
        </button>
        <button
          onClick={() => setTab("parts")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "parts" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
        >
          📖 All Parts
        </button>
      </div>

      {/* COURSES TAB */}
      {tab === "courses" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-100">Courses / Paths</h2>
            <button
              onClick={() => setShowCreateCourse(!showCreateCourse)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
            >
              <span>+</span> New Course
            </button>
          </div>

          {/* Create Course Form */}
          {showCreateCourse && (
            <div className="game-card p-6 mb-6 border border-blue-700/30">
              <h3 className="text-lg font-bold text-gray-100 mb-4">Create New Course</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Slug (URL-safe ID)</label>
                  <input
                    value={cSlug}
                    onChange={(e) => setCSlug(e.target.value.replace(/[^a-z0-9-]/g, ""))}
                    placeholder="e.g. cpp-systems"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Icon (emoji)</label>
                  <input
                    value={cIcon}
                    onChange={(e) => setCIcon(e.target.value)}
                    placeholder="📚"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input
                    value={cTitle}
                    onChange={(e) => setCTitle(e.target.value)}
                    placeholder="e.g. C++ Systems Engineering"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={cDesc}
                    onChange={(e) => setCDesc(e.target.value)}
                    placeholder="What this course covers..."
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Order</label>
                  <input
                    type="number"
                    value={cOrder}
                    onChange={(e) => setCOrder(e.target.value)}
                    placeholder={String(courses.length + 1)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={createCourse}
                  disabled={!cSlug || !cTitle || creatingCourse}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {creatingCourse ? "Creating..." : "Create Course"}
                </button>
                <button
                  onClick={() => setShowCreateCourse(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Courses List */}
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="game-card overflow-hidden">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-700/30 transition-colors"
                  onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                >
                  <div className="w-12 h-12 rounded-xl bg-yellow-600/20 flex items-center justify-center text-2xl">
                    {course.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-100 truncate">{course.title}</h3>
                      {!course.published && <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">Draft</span>}
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {course.slug} · {course.parts.length} parts · Order {course.order}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setAssigningCourseId(assigningCourseId === course.id ? null : course.id); }}
                      className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-300 rounded-lg text-sm transition-colors"
                    >
                      + Part
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(deleteConfirm === course.id ? null : course.id); }}
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg text-sm transition-colors"
                    >
                      Delete
                    </button>
                    <span className={`transition-transform ${expandedCourse === course.id ? "rotate-180" : ""} text-gray-400`}>▾</span>
                  </div>
                </div>

                {deleteConfirm === course.id && (
                  <div className="px-4 pb-3 bg-red-900/10 border-t border-red-800/30">
                    <p className="text-red-300 text-sm py-2">
                      Delete &quot;{course.title}&quot;? Parts won&apos;t be deleted, just unassigned.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => deleteCourse(course.id)} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm">Yes, Delete</button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm">Cancel</button>
                    </div>
                  </div>
                )}

                {assigningCourseId === course.id && (
                  <div className="px-4 pb-3 bg-green-900/10 border-t border-green-800/30">
                    <p className="text-green-300 text-sm py-2 font-medium">Assign an unassigned part to this course:</p>
                    {unassigned.length === 0 ? (
                      <p className="text-gray-500 text-sm pb-2">No unassigned parts available. Create a new part first.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 pb-2">
                        {unassigned.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => assignPart(course.id, p.id)}
                            className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-300 border border-green-700/30 rounded-lg text-sm transition-colors"
                          >
                            {p.title} <span className="text-green-500 text-xs">({p._count.lessons} lessons)</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <button onClick={() => setAssigningCourseId(null)} className="text-sm text-gray-500 hover:text-gray-300">Cancel</button>
                  </div>
                )}

                {expandedCourse === course.id && (
                  <div className="border-t border-gray-700/50 px-4 py-3 bg-gray-800/30">
                    {course.parts.length === 0 ? (
                      <p className="text-gray-500 text-sm py-2">No parts assigned yet. Click &quot;+ Part&quot; to add one.</p>
                    ) : (
                      <div className="space-y-2">
                        {course.parts.map((part) => (
                          <div key={part.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-700/20 hover:bg-gray-700/40 transition-colors">
                            <div className="w-8 h-8 rounded bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                              {part.order}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-gray-200 text-sm font-medium truncate block">{part.title}</span>
                              <span className="text-gray-500 text-xs">{part.slug} · {part._count.lessons} lessons</span>
                            </div>
                            <Link
                              href={`/admin/content/${part.id}`}
                              className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded text-xs transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => unassignPart(course.id, part.id)}
                              className="px-3 py-1 bg-gray-600/20 hover:bg-red-600/30 text-gray-400 hover:text-red-300 rounded text-xs transition-colors"
                              title="Remove from course"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📚</div>
              <h2 className="text-xl font-bold text-gray-300 mb-2">No Courses Yet</h2>
              <p className="text-gray-500 mb-4">Create a course like &quot;C++ Systems Engineering&quot; or &quot;Full Stack&quot; to group your parts.</p>
              <button onClick={() => setShowCreateCourse(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                + Create First Course
              </button>
            </div>
          )}

          {unassigned.length > 0 && (
            <div className="mt-8">
              <h3 className="text-md font-bold text-gray-300 mb-3 flex items-center gap-2">
                <span className="text-yellow-400">⚠️</span> Unassigned Parts ({unassigned.length})
              </h3>
              <div className="game-card p-4">
                <p className="text-gray-500 text-sm mb-3">These parts are not assigned to any course. Assign them above or edit them below.</p>
                <div className="space-y-2">
                  {unassigned.map((part) => (
                    <div key={part.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-700/20">
                      <div className="w-8 h-8 rounded bg-yellow-600/20 flex items-center justify-center text-yellow-400 font-bold text-sm">
                        {part.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-200 text-sm font-medium">{part.title}</span>
                        <span className="text-gray-500 text-xs ml-2">{part.slug} · {part._count.lessons} lessons</span>
                      </div>
                      <Link
                        href={`/admin/content/${part.id}`}
                        className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded text-xs transition-colors"
                      >
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ALL PARTS TAB */}
      {tab === "parts" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-100">All Parts</h2>
            <button
              onClick={() => setShowCreatePart(!showCreatePart)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
            >
              <span>+</span> New Part
            </button>
          </div>

          {showCreatePart && (
            <div className="game-card p-6 mb-6 border border-blue-700/30">
              <h3 className="text-lg font-bold text-gray-100 mb-4">Create New Part</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Slug</label>
                  <input value={pSlug} onChange={(e) => setPSlug(e.target.value.replace(/[^a-z0-9-]/g, ""))} placeholder="e.g. w25" className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Order</label>
                  <input type="number" value={pOrder} onChange={(e) => setPOrder(e.target.value)} placeholder={String(parts.length + 1)} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input value={pTitle} onChange={(e) => setPTitle(e.target.value)} placeholder="e.g. Advanced Protocols" className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="Brief description..." rows={2} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none resize-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={createPart} disabled={!pSlug || !pTitle || !pOrder || creatingPart} className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
                  {creatingPart ? "Creating..." : "Create Part"}
                </button>
                <button onClick={() => setShowCreatePart(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {parts.map((part) => (
              <div key={part.id} className="game-card overflow-hidden">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-700/30 transition-colors"
                  onClick={() => setExpandedPart(expandedPart === part.id ? null : part.id)}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-lg">
                    {part.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-100 truncate">{part.title}</h3>
                    <p className="text-sm text-gray-400 truncate">{part.slug} · {part.lessons.length} lessons {part.quest ? "· 1 quest" : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/content/${part.id}`} onClick={(e) => e.stopPropagation()} className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg text-sm transition-colors">Edit</Link>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(deleteConfirm === part.id ? null : part.id); }} className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg text-sm transition-colors">Delete</button>
                    <span className={`transition-transform ${expandedPart === part.id ? "rotate-180" : ""} text-gray-400`}>▾</span>
                  </div>
                </div>

                {deleteConfirm === part.id && (
                  <div className="px-4 pb-3 bg-red-900/10 border-t border-red-800/30">
                    <p className="text-red-300 text-sm py-2">Delete &quot;{part.title}&quot; and all its {part.lessons.length} lessons?</p>
                    <div className="flex gap-2">
                      <button onClick={() => deletePart(part.id)} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm">Yes, Delete</button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm">Cancel</button>
                    </div>
                  </div>
                )}

                {expandedPart === part.id && (
                  <div className="border-t border-gray-700/50 px-4 py-3 bg-gray-800/30">
                    {part.lessons.length === 0 ? (
                      <p className="text-gray-500 text-sm py-2">No lessons yet</p>
                    ) : (
                      <div className="space-y-1">
                        {part.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-gray-700/30">
                            <span className="text-gray-500 text-sm w-6 text-right">{lesson.order}.</span>
                            <span className="flex-1 text-gray-300 text-sm truncate">{lesson.title}</span>
                            <span className="text-gray-500 text-xs">{lesson.durationMinutes}min</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {part.quest && (
                      <div className="flex items-center gap-3 py-1.5 px-2 mt-2 rounded bg-purple-900/10 border border-purple-800/20">
                        <span className="text-purple-400 text-sm">⚔️</span>
                        <span className="flex-1 text-purple-300 text-sm">{part.quest.title}</span>
                        <span className="text-purple-500 text-xs">Quest</span>
                      </div>
                    )}
                    <Link href={`/admin/content/${part.id}`} className="inline-block mt-3 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
                      Manage Lessons →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {parts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📖</div>
              <h2 className="text-xl font-bold text-gray-300 mb-2">No Parts Yet</h2>
              <p className="text-gray-500 mb-4">Create your first part to get started.</p>
              <button onClick={() => setShowCreatePart(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                + Create First Part
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
