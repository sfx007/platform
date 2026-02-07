import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCppDashboard } from "@/lib/cpp-modules";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const dashboard = await getCppDashboard(user.id);
  return NextResponse.json(dashboard);
}
