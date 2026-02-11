import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/profile/[username] — Public user profile.
 * Returns basic profile info, stats, badges, and activity heatmap.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        profileImage: true,
        bio: true,
        level: true,
        xp: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
        lastActiveAt: true,
      },
    });

    if (!user || !user.displayName) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const [
      submissions,
      achievements,
      progressEvents,
      userProgress,
      totalUsers,
    ] = await Promise.all([
      prisma.submission.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          lessonId: true,
          questId: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.userAchievement.findMany({
        where: { userId: user.id },
        include: { achievement: true },
        orderBy: { unlockedAt: "desc" },
      }),
      prisma.progressEvent.findMany({
        where: { userId: user.id, createdAt: { gte: oneYearAgo } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.userProgress.findMany({
        where: { userId: user.id },
      }),
      prisma.user.count({ where: { xp: { gt: 0 } } }),
    ]);

    // Stats
    const passedLessons = submissions.filter((s) => s.lessonId && s.status === "passed");
    const passedQuests = submissions.filter((s) => s.questId && s.status === "passed");
    const uniquePassedLessonIds = new Set(passedLessons.map((s) => s.lessonId));
    const uniquePassedQuestIds = new Set(passedQuests.map((s) => s.questId));

    const [totalLessons, totalQuests] = await Promise.all([
      prisma.lesson.count(),
      prisma.quest.count(),
    ]);

    const usersAbove = await prisma.user.count({ where: { xp: { gt: user.xp } } });
    const rank = usersAbove + 1;

    // Activity heatmap
    const dayMap = new Map<string, number>();
    for (const sub of submissions) {
      const day = sub.createdAt.toISOString().slice(0, 10);
      if (sub.createdAt >= oneYearAgo) {
        dayMap.set(day, (dayMap.get(day) || 0) + 1);
      }
    }
    for (const evt of progressEvents) {
      const day = evt.createdAt.toISOString().slice(0, 10);
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    }
    const activityDays = Array.from(dayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Badges
    const badges = achievements.map((ua) => ({
      id: ua.achievement.id,
      name: ua.achievement.title,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      category: ua.achievement.category,
      earnedAt: ua.unlockedAt.toISOString(),
    }));

    const partsCompleted = userProgress.filter((up) => up.questCompleted).length;

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: user.profileImage || "/img/new_boots_profile.webp",
        bio: user.bio,
        level: user.level,
        xp: user.xp,
        streak: user.currentStreak,
        longestStreak: user.longestStreak,
        rank,
        totalUsers,
        joinedAt: user.createdAt.toISOString(),
        lastActiveAt: user.lastActiveAt.toISOString(),
      },
      stats: {
        lessonsCompleted: uniquePassedLessonIds.size,
        questsCompleted: uniquePassedQuestIds.size,
        partsCompleted,
        totalCompleted: uniquePassedLessonIds.size + uniquePassedQuestIds.size,
        totalLessons,
        totalQuests,
        totalParts: 24,
        submissions: submissions.length,
        passRate: submissions.length > 0
          ? Math.round((submissions.filter((s) => s.status === "passed").length / submissions.length) * 100)
          : 0,
      },
      badges,
      activityDays,
    });
  } catch (error) {
    console.error("Public profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
