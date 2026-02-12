import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ADMIN_USERS = ["obajali", "admin"];

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !ADMIN_USERS.includes(user.username)) return null;
  return user;
}

// POST — assign a part to this course
export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { courseId } = await params;
  const body = await req.json();
  const { partId, order } = body;

  if (!partId) return NextResponse.json({ error: "partId required" }, { status: 400 });

  // Verify course exists
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const part = await prisma.part.update({
    where: { id: partId },
    data: {
      courseId,
      ...(order !== undefined && { order: Number(order) }),
    },
  });

  return NextResponse.json({ part });
}

// DELETE — unassign a part from this course
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { courseId } = await params;
  const body = await req.json();
  const { partId } = body;

  if (!partId) return NextResponse.json({ error: "partId required" }, { status: 400 });

  const part = await prisma.part.findFirst({ where: { id: partId, courseId } });
  if (!part) return NextResponse.json({ error: "Part not in this course" }, { status: 404 });

  await prisma.part.update({ where: { id: partId }, data: { courseId: null } });

  return NextResponse.json({ ok: true });
}
