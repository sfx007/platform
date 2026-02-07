import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCppExercise, updateExerciseStatus } from "@/lib/cpp-modules";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const exercise = await getCppExercise(slug, user.id);
  if (!exercise) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });

  return NextResponse.json({ exercise });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { slug, status, gitRepoLink, notes, defenseScore } = body;

  if (!slug || !status) {
    return NextResponse.json({ error: "Missing slug or status" }, { status: 400 });
  }

  const validStatuses = ["not_started", "in_progress", "completed", "defended"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const result = await updateExerciseStatus(user.id, slug, status, {
      gitRepoLink,
      notes,
      defenseScore,
    });
    return NextResponse.json({ success: true, progress: result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
