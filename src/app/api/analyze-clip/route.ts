import { NextResponse } from "next/server";

import type { PressureTrigger } from "@/lib/mock-data";

type AnalyzeClipRequest = {
  playerName?: string;
  matchSession?: string;
  clipSource?: string;
  timestampOrRange?: string;
  scoreContext?: string;
  pressureTrigger?: PressureTrigger | "";
  coachNote?: string;
};

type AnalysisDraftResponse = {
  serveOrReturn: string;
  pointOutcome: string;
  firstServeIn: string;
  rallyLengthEstimate: string;
  primaryPattern: string;
  aggressionLevel: string;
  riskDecision: string;
  shotThatDecidedPoint: string;
  errorOrWinnerType: string;
  resetBehavior: string;
  bodyLanguageNote: string;
  tacticalPrinciple: string;
  coachingTakeaway: string;
  tags: string[];
  confidenceLevel: string;
  eliteComparison: string;
  analysisNotes: string;
};

function hasScoreTerm(scoreContext: string, term: string) {
  return scoreContext.toLowerCase().includes(term.toLowerCase());
}

function createMockAnalysis(input: AnalyzeClipRequest): AnalysisDraftResponse {
  const trigger = input.pressureTrigger || "Pressure point";
  const scoreContext = input.scoreContext?.trim() || "score context not supplied";
  const coachNote = input.coachNote?.trim();
  const isReturnPoint =
    trigger === "Break Point" ||
    trigger === "Match Point" ||
    hasScoreTerm(scoreContext, "break");
  const isLateSet =
    trigger === "Set Point" ||
    trigger === "Match Point" ||
    trigger === "Tiebreak" ||
    hasScoreTerm(scoreContext, "tiebreak") ||
    hasScoreTerm(scoreContext, "set");
  const isDeucePattern = trigger === "Deuce" || hasScoreTerm(scoreContext, "deuce");

  if (isReturnPoint) {
    return {
      serveOrReturn: "Return",
      pointOutcome: trigger === "Match Point" ? "Saved / extended" : "Won",
      firstServeIn: trigger === "Break Point" ? "No - second serve observed" : "Yes - visible",
      rallyLengthEstimate: isLateSet ? "7-9 shots" : "5-7 shots",
      primaryPattern:
        "Compact return through the middle, early baseline hold, then backhand redirection once balance was established",
      aggressionLevel: isLateSet ? "Controlled with selective acceleration" : "Balanced",
      riskDecision:
        "Protected return margin before attacking the first ball that created court-position advantage",
      shotThatDecidedPoint: "Backhand down the line after a neutral crosscourt exchange",
      errorOrWinnerType: "Opponent forced forehand error",
      resetBehavior: "Turned away promptly and restored receiving position for the next point",
      bodyLanguageNote:
        "Stable receiving posture with low emotional variance during the pressure moment",
      tacticalPrinciple:
        "Remove early angles under pressure, then redirect only from a balanced base",
      coachingTakeaway:
        "Keep the deep-middle return as the default target before looking to change direction.",
      tags: [
        trigger.toLowerCase(),
        "return depth",
        "baseline hold",
        "redirection",
      ],
      confidenceLevel: input.scoreContext ? "Medium-high" : "Medium",
      eliteComparison:
        "Djokovic-style deep-middle return pattern: compact contact and neutral geometry before redirection",
      analysisNotes: coachNote
        ? `Mock draft used the coach note as context: ${coachNote}`
        : "Mock draft only. No video frames were processed for this analysis.",
    };
  }

  return {
    serveOrReturn: "Serve",
    pointOutcome: "Won",
    firstServeIn: "Yes - visible",
    rallyLengthEstimate: isLateSet ? "6-8 shots" : isDeucePattern ? "4-6 shots" : "5-7 shots",
    primaryPattern: isLateSet
      ? "Body or wide first serve followed by a committed forehand into open court"
      : "Wide first serve followed by an early forehand into the open court",
    aggressionLevel: isLateSet ? "High, but organized" : "Controlled",
    riskDecision: isLateSet
      ? "Accepted first-strike risk because the serve location created a predictable plus-one ball"
      : "Used a repeatable serve-plus-one pattern rather than forcing a low-percentage finish",
    shotThatDecidedPoint: isLateSet ? "Forehand approach into open court" : "Inside-out forehand",
    errorOrWinnerType: isLateSet ? "Forced passing-shot error" : "Forced backhand error",
    resetBehavior: "Brief positive response, then a deliberate breathing reset",
    bodyLanguageNote: `Committed posture despite ${scoreContext}`,
    tacticalPrinciple:
      "Use serve location to create a predictable first-forehand opportunity",
    coachingTakeaway:
      "Define both serve location and plus-one target before the pressure point begins.",
    tags: [
      trigger.toLowerCase(),
      "serve plus one",
      "first strike",
      "forehand",
    ],
    confidenceLevel: input.scoreContext ? "High" : "Medium",
    eliteComparison:
      "Federer-style serve-plus-one structure: serve width creates space for the first forehand",
    analysisNotes: coachNote
      ? `Mock draft used the coach note as context: ${coachNote}`
      : "Mock draft only. No video frames were processed for this analysis.",
  };
}

export async function POST(request: Request) {
  const input = (await request.json()) as AnalyzeClipRequest;

  /*
   * This endpoint is intentionally mocked for the current prototype.
   * The production workflow will replace this branch with:
   * - video/frame extraction from the submitted clip source
   * - VLM clip observation across sampled frames
   * - LLM structured analysis into coach-reviewable fields
   * - elite library comparison against verified pressure-point clips
   *
   * No API keys, external AI services, Supabase, auth, uploads, or file storage
   * are used here.
   */
  return NextResponse.json(createMockAnalysis(input));
}
