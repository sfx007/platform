import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ADMIN_USERS = ["obajali", "admin"];

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !ADMIN_USERS.includes(user.username)) return null;
  return user;
}

// GET — list all courses with their parts
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const courses = await prisma.course.findMany({
    orderBy: { order: "asc" },
    include: {
      parts: {
        orderBy: { order: "asc" },
        select: { id: true, slug: true, title: true, order: true, _count: { select: { lessons: true } } },
      },
    },
  });

  // Also get unassigned parts (no courseId)
  const unassigned = await prisma.part.findMany({
    where: { courseId: null },
    orderBy: { order: "asc" },
    select: { id: true, slug: true, title: true, order: true, _count: { select: { lessons: true } } },
  });

  return NextResponse.json({ courses, unassigned });
}

// POST — create a new course
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const { slug, title, description, icon, order } = body;

  if (!slug || !title) {
    return NextResponse.json({ error: "slug and title are required" }, { status: 400 });
  }

  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: `Course "${slug}" already exists` }, { status: 409 });
  }

  const course = await prisma.course.create({
    data: {
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      title,
      description: description || "",
      icon: icon || "📚",
      order: Number(order) || 0,
    },
  });

  return NextResponse.json({ course }, { status: 201 });
}
