import { prisma } from "@/lib/db";

/**
 * Create a notification for a user.
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  link?: string
) {
  try {
    return await prisma.notification.create({
      data: { userId, type, title, body, link },
    });
  } catch (e) {
    console.error("Failed to create notification:", e);
    return null;
  }
}

/**
 * Convenience helpers for specific notification types.
 */
export const notify = {
  levelUp: (userId: string, newLevel: number) =>
    createNotification(userId, "level_up", "🎉 Level Up!", `You reached Level ${newLevel}!`, "/profile"),

  achievement: (userId: string, name: string) =>
    createNotification(userId, "achievement", "🏆 Achievement Unlocked!", `You earned "${name}"`, "/profile"),

  streak: (userId: string, days: number) =>
    createNotification(userId, "streak", "🔥 Streak Milestone!", `${days}-day learning streak!`, "/progress"),

  lessonComplete: (userId: string, lessonTitle: string, partSlug: string) =>
    createNotification(userId, "lesson_complete", "✅ Lesson Complete", `You completed "${lessonTitle}"`, `/lesson/${partSlug}`),

  questComplete: (userId: string, questTitle: string) =>
    createNotification(userId, "quest_complete", "⚔️ Quest Complete!", `You conquered "${questTitle}"`, "/parts"),

  reviewDue: (userId: string, count: number) =>
    createNotification(userId, "review_due", "📝 Reviews Due", `You have ${count} reviews waiting`, "/reviews"),

  newMessage: (userId: string, fromName: string) =>
    createNotification(userId, "new_message", "💬 New Message", `${fromName} sent you a message`, "/messages"),

  system: (userId: string, title: string, body: string, link?: string) =>
    createNotification(userId, "system", title, body, link),
};
