import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ADMIN_USERS = ["obajali", "admin"];

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !ADMIN_USERS.includes(user.username)) return null;
  return user;
}

// GET — get a single course with parts & lessons
export async function GET(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      parts: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" }, select: { id: true, slug: true, title: true, order: true, durationMinutes: true } },
          quest: { select: { id: true, slug: true, title: true } },
        },
      },
    },
  });

  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  return NextResponse.json({ course });
}

// PUT — update a course
export async function PUT(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { courseId } = await params;
  const body = await req.json();
  const { slug, title, description, icon, order, published } = body;

  if (slug) {
    const conflict = await prisma.course.findFirst({ where: { slug, id: { not: courseId } } });
    if (conflict) return NextResponse.json({ error: `Slug "${slug}" is taken` }, { status: 409 });
  }

  const course = await prisma.course.update({
    where: { id: courseId },
    data: {
      ...(slug && { slug }),
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(icon && { icon }),
      ...(order !== undefined && { order: Number(order) }),
      ...(published !== undefined && { published }),
    },
  });

  return NextResponse.json({ course });
}

// DELETE — delete a course (parts become unassigned, not deleted)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { courseId } = await params;

  // Unassign parts first (set courseId to null)
  await prisma.part.updateMany({ where: { courseId }, data: { courseId: null } });
  await prisma.course.delete({ where: { id: courseId } });

  return NextResponse.json({ ok: true });
}
