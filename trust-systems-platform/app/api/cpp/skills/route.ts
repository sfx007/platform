import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const skills = await prisma.cppSkill.findMany({
    orderBy: { moduleNumber: "asc" },
    include: {
      userCppSkills: { where: { userId: user.id } },
    },
  });

  const result = skills.map((s) => {
    const us = s.userCppSkills[0];
    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      description: s.description,
      category: s.category,
      moduleNumber: s.moduleNumber,
      unlockExercise: s.unlockExercise,
      careerValue: s.careerValue,
      proofCriteria: JSON.parse(s.proofCriteria),
      level: us?.level ?? "locked",
      timesUsed: us?.timesUsed ?? 0,
    };
  });

  return NextResponse.json({ skills: result });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { skillSlug, action } = await request.json();
  if (!skillSlug) return NextResponse.json({ error: "Missing skillSlug" }, { status: 400 });

  const skill = await prisma.cppSkill.findUnique({ where: { slug: skillSlug } });
  if (!skill) return NextResponse.json({ error: "Skill not found" }, { status: 404 });

  if (action === "unlock") {
    const result = await prisma.userCppSkill.upsert({
      where: { userId_skillId: { userId: user.id, skillId: skill.id } },
      update: { level: "unlocked" },
      create: { userId: user.id, skillId: skill.id, level: "unlocked" },
    });
    return NextResponse.json({ success: true, skill: result });
  }

  if (action === "increment") {
    const existing = await prisma.userCppSkill.findUnique({
      where: { userId_skillId: { userId: user.id, skillId: skill.id } },
    });
    if (!existing) return NextResponse.json({ error: "Skill not unlocked" }, { status: 400 });

    const newCount = existing.timesUsed + 1;
    let newLevel = existing.level;
    if (newCount >= 50) newLevel = "platinum";
    else if (newCount >= 25) newLevel = "gold";
    else if (newCount >= 10) newLevel = "silver";
    else if (newCount >= 3) newLevel = "bronze";

    const result = await prisma.userCppSkill.update({
      where: { id: existing.id },
      data: { timesUsed: newCount, level: newLevel, updatedAt: new Date() },
    });
    return NextResponse.json({ success: true, skill: result });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
