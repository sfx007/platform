import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCppModules } from "@/lib/cpp-modules";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const modules = await getCppModules(user.id);
  return NextResponse.json({ modules });
}
