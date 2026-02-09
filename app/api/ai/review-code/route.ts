import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  callAIMonitor,
  buildUserMessage,
  type CoachResponse,
} from "@/lib/ai-monitor";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code, language = "cpp", lessonTitle, lessonGoal } = body as {
      code: string;
      language?: string;
      lessonTitle?: string;
      lessonGoal?: string;
    };

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    const reviewPrompt = `Review this ${language} code for a lesson titled "${lessonTitle || "unknown"}".
Goal: ${lessonGoal || "not specified"}.

Focus on:
1. Correctness: Does it achieve the goal?
2. Style: Is it clean, idiomatic ${language}?
3. Edge cases: What inputs would break it?
4. Performance: Any obvious inefficiencies?
5. Security: Any unsafe patterns?

Set coach_mode to "work". Provide diagnosis with specific line references.
In graduated_hints, give improvement suggestions from easy to hard.
Create flashcards for any common mistakes or patterns found.`;

    const fullMessage = buildUserMessage({
      userMessage: reviewPrompt,
      code: code.slice(0, 10000),
    });

    const response: CoachResponse = await callAIMonitor(fullMessage);

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (err) {
    console.error("AI review error:", err);
    const errMsg = err instanceof Error ? err.message : "AI service error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
