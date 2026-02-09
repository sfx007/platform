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
    const {
      proof,
      code,
      terminalOutput,
      lessonTitle,
      lessonGoal,
      passCriteria,
    } = body as {
      proof: string;
      code?: string;
      terminalOutput?: string;
      lessonTitle?: string;
      lessonGoal?: string;
      passCriteria?: string;
    };

    if (!proof || typeof proof !== "string") {
      return NextResponse.json({ error: "Proof required" }, { status: 400 });
    }

    const checkPrompt = `Check this learner's proof submission.

Lesson: "${lessonTitle || "unknown"}"
Goal: ${lessonGoal || "not specified"}
Pass Criteria: ${passCriteria || "not specified"}

PROOF SUBMITTED:
${proof.slice(0, 5000)}

${terminalOutput ? `TERMINAL OUTPUT:\n${terminalOutput.slice(0, 3000)}` : ""}

Set coach_mode to "prove".
In diagnosis, evaluate whether the proof meets the pass criteria.
- If it passes: confidence > 0.8, congratulate, suggest improvements, set next_actions to "ship" phase.
- If it fails: identify specific gaps, provide graduated_hints to fix them, create flashcards for the missing concepts.
Be strict but fair. The learner must demonstrate understanding, not just working code.`;

    const fullMessage = buildUserMessage({
      userMessage: checkPrompt,
      code: code?.slice(0, 8000),
      terminalOutput: terminalOutput?.slice(0, 3000),
    });

    const response: CoachResponse = await callAIMonitor(fullMessage);

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (err) {
    console.error("AI proof check error:", err);
    const errMsg = err instanceof Error ? err.message : "AI service error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
