import { NextResponse } from "next/server";

import type {
  PlayerPointOutcome,
  PressureTrigger,
  ServeOrReturn,
} from "@/lib/pinpoint-types";
import {
  requireAuthenticatedUser,
  SupabaseAuthenticationError,
} from "@/lib/supabase/authenticated-server";

type AnalyzeClipRequest = {
  playerName?: string;
  matchSession?: string;
  clipSource?: string;
  timestampOrRange?: string;
  scoreContext?: string;
  pressureTrigger?: PressureTrigger | "";
  playerPointOutcome?: PlayerPointOutcome;
  serveOrReturn?: ServeOrReturn | "";
  coachNote?: string;
};

type AnalysisDraftResponse = {
  serveOrReturn: string;
  pointOutcome: string;
  playerPointOutcome: string;
  firstServeIn: string;
  rallyLengthEstimate: string;
  primaryPattern: string;
  pressurePatternFamily: string;
  likelyBreakdownMoment: string;
  decisionQuality: string;
  executionQuality: string;
  missedOpportunity: string;
  eliteReferencePattern: string;
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
  nextTimeAdjustment: string;
  trainingFocus: string;
  analysisNotes: string;
};

function hasScoreTerm(scoreContext: string, term: string) {
  return scoreContext.toLowerCase().includes(term.toLowerCase());
}

function isLostOutcome(outcome: string) {
  return outcome.toLowerCase().includes("lost");
}

function resolvePointOutcome(input: AnalyzeClipRequest) {
  return input.playerPointOutcome && input.playerPointOutcome !== "Unknown"
    ? input.playerPointOutcome
    : "Unknown";
}

function resolveServeOrReturn(
  input: AnalyzeClipRequest,
  fallback: "Serve" | "Return",
) {
  return input.serveOrReturn && input.serveOrReturn !== "Unknown"
    ? input.serveOrReturn
    : fallback;
}

function createMockAnalysis(input: AnalyzeClipRequest): AnalysisDraftResponse {
  const trigger = input.pressureTrigger || "Pressure point";
  const scoreContext = input.scoreContext?.trim() || "score context not supplied";
  const coachNote = input.coachNote?.trim();
  const playerPointOutcome = resolvePointOutcome(input);
  const playerLostPoint = isLostOutcome(playerPointOutcome);
  const isReturnPoint =
    input.serveOrReturn === "Return" ||
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
      serveOrReturn: resolveServeOrReturn(input, "Return"),
      pointOutcome: playerPointOutcome,
      playerPointOutcome,
      firstServeIn: trigger === "Break Point" ? "No - second serve observed" : "Yes - visible",
      rallyLengthEstimate: isLateSet ? "7-9 shots" : "5-7 shots",
      primaryPattern: playerLostPoint
        ? "Safe return shape followed by early retreat, leaving the player without enough court position to redirect"
        : "Compact return through the middle, early baseline hold, then backhand redirection once balance was established",
      pressurePatternFamily: playerLostPoint
        ? "Return pressure - baseline hold and reset under pressure"
        : "Return pressure - deep-middle neutralization into controlled redirection",
      likelyBreakdownMoment: playerLostPoint
        ? "The point appears to break down when the player gives up baseline position after the return instead of holding neutral depth for one more ball."
        : "The point turns when the player protects the return margin, holds the baseline, and waits for a balanced redirection ball.",
      decisionQuality: playerLostPoint
        ? "The initial return decision is sound, but the next decision becomes too passive for the break-point context."
        : "The player makes a disciplined high-margin return decision before choosing the direction change.",
      executionQuality: playerLostPoint
        ? "Return execution is workable; the follow-up ball needs more depth and recovery balance."
        : "Execution is stable through the return and the first neutral exchange.",
      missedOpportunity: playerLostPoint
        ? "The missed opportunity is to reset with a deep middle ball and rebuild court position before absorbing the next attack."
        : "The player uses the available opportunity by redirecting only after balance is established.",
      eliteReferencePattern: playerLostPoint
        ? "Djokovic elastic defense into neutral reset"
        : "Djokovic deep-middle return plus one",
      aggressionLevel: playerLostPoint
        ? "Controlled, but too passive after contact"
        : isLateSet ? "Controlled with selective acceleration" : "Balanced",
      riskDecision: playerLostPoint
        ? "The player avoids early risk, but does not take enough positional responsibility after the return."
        : "Protected return margin before attacking the first ball that created court-position advantage",
      shotThatDecidedPoint: playerLostPoint
        ? "Backhand neutral ball that lands short after the return"
        : "Backhand down the line after a neutral crosscourt exchange",
      errorOrWinnerType: playerLostPoint
        ? "Player unforced or pressured backhand error after losing court position"
        : "Opponent forced forehand error",
      resetBehavior: playerLostPoint
        ? "Needs a clearer between-ball reset after absorbing the serve pressure"
        : "Turned away promptly and restored receiving position for the next point",
      bodyLanguageNote:
        "Stable receiving posture with low emotional variance during the pressure moment",
      tacticalPrinciple: playerLostPoint
        ? "After a safe return under pressure, the next job is to hold depth and recover court position before trying to redirect."
        : "Remove early angles under pressure, then redirect only from a balanced base",
      coachingTakeaway: playerLostPoint
        ? "Frame this as a recover-and-reset point: keep the deep-middle return, then train one heavy neutral ball before any direction change."
        : "Keep the deep-middle return as the default target before looking to change direction.",
      tags: [
        trigger.toLowerCase(),
        "return depth",
        "baseline hold",
        playerLostPoint ? "defensive reset" : "redirection",
      ],
      confidenceLevel: input.scoreContext ? "Medium-high" : "Medium",
      eliteComparison: playerLostPoint
        ? "Compared with the current elite library, this is closest to Djokovic-style defensive reset patterns: absorb pressure, recover depth, then rebuild before accelerating."
        : "Compared with the current elite library, this resembles a Djokovic-style deep-middle return pattern: compact contact and neutral geometry before redirection.",
      nextTimeAdjustment: playerLostPoint
        ? "Next time, the player should look to return through the middle, recover to a balanced base, and play one deeper neutral ball before changing direction."
        : "Next time, the player should keep the same return target and only redirect once the opponent has given a balanced ball.",
      trainingFocus: playerLostPoint
        ? "Training focus: break-point return plus one reset, with a required deep neutral ball after the return before any line change."
        : "Training focus: repeat deep-middle return plus one patterns with balance checks before redirection.",
      analysisNotes: coachNote
        ? `Mock draft used the coach note as context: ${coachNote}`
        : "Mock draft only. No video frames were processed for this analysis.",
    };
  }

  return {
    serveOrReturn: resolveServeOrReturn(input, "Serve"),
    pointOutcome: playerPointOutcome,
    playerPointOutcome,
    firstServeIn: "Yes - visible",
    rallyLengthEstimate: isLateSet ? "6-8 shots" : isDeucePattern ? "4-6 shots" : "5-7 shots",
    primaryPattern: playerLostPoint
      ? "Serve created a neutral start, but the player accelerated before creating enough court position"
      : isLateSet
      ? "Body or wide first serve followed by a committed forehand into open court"
      : "Wide first serve followed by an early forehand into the open court",
    pressurePatternFamily: playerLostPoint
      ? "Serve pressure - first-strike selection and margin control"
      : "Serve pressure - serve plus one court opening",
    likelyBreakdownMoment: playerLostPoint
      ? "The point appears to break down when the player attacks from a neutral ball before the serve has created a clear plus-one advantage."
      : "The point turns when the serve location creates a predictable first forehand and the player commits to the open-court target.",
    decisionQuality: playerLostPoint
      ? "The attacking intent is useful, but the timing of the attack is early for the court position available."
      : "The player makes a clear pre-point pattern decision and follows it with appropriate first-strike intent.",
    executionQuality: playerLostPoint
      ? "The contact quality looks lower-margin because balance and spacing are not fully established before acceleration."
      : "Execution supports the tactical plan with a stable serve and committed plus-one ball.",
    missedOpportunity: playerLostPoint
      ? "The missed opportunity is to use one heavier crosscourt ball or a bigger target to create space before finishing."
      : "The player converts the available first-strike opportunity without adding unnecessary rally risk.",
    eliteReferencePattern: playerLostPoint
      ? isLateSet
        ? "Nadal heavy shape before direction change"
        : "Federer wide serve plus one into open court"
      : isLateSet
        ? "Alcaraz serve plus one full-blitz transition"
        : "Federer wide serve plus one into open court",
    aggressionLevel: playerLostPoint
      ? "High intent, low-margin timing"
      : isLateSet ? "High, but organized" : "Controlled",
    riskDecision: playerLostPoint
      ? "Chose a low-margin target before the point had been sufficiently built."
      : isLateSet
      ? "Accepted first-strike risk because the serve location created a predictable plus-one ball"
      : "Used a repeatable serve-plus-one pattern rather than forcing a low-percentage finish",
    shotThatDecidedPoint: playerLostPoint
      ? "Forehand acceleration from a neutral court position"
      : isLateSet ? "Forehand approach into open court" : "Inside-out forehand",
    errorOrWinnerType: playerLostPoint
      ? "Player forehand error or opponent counter after low-margin target"
      : isLateSet ? "Forced passing-shot error" : "Forced backhand error",
    resetBehavior: playerLostPoint
      ? "Needs a cleaner reset cue after the missed attacking decision"
      : "Brief positive response, then a deliberate breathing reset",
    bodyLanguageNote: `Committed posture despite ${scoreContext}`,
    tacticalPrinciple: playerLostPoint
      ? "Create court position before acceleration; first-strike intent is strongest when the serve has made the next ball predictable."
      : "Use serve location to create a predictable first-forehand opportunity",
    coachingTakeaway: playerLostPoint
      ? "Keep the attacking identity, but train the player to earn the attack with serve location, height, or depth before taking the lower-margin target."
      : "Define both serve location and plus-one target before the pressure point begins.",
    tags: [
      trigger.toLowerCase(),
      "serve plus one",
      "first strike",
      playerLostPoint ? "margin control" : "forehand",
    ],
    confidenceLevel: input.scoreContext ? "High" : "Medium",
    eliteComparison: playerLostPoint
      ? "Compared with the current elite library, the better match is the Nadal/Federer principle of creating shape or space before changing direction under pressure."
      : "Compared with the current elite library, this resembles Federer-style serve-plus-one structure: serve width creates space for the first forehand.",
    nextTimeAdjustment: playerLostPoint
      ? "Next time, the player should look to use a bigger target first, create court position, and attack only after the short or stretched ball appears."
      : "Next time, the player should keep pairing the serve location with a called plus-one target before the point begins.",
    trainingFocus: playerLostPoint
      ? "Training focus: serve plus one decision gates - attack only after the serve opens space, otherwise play heavy crosscourt to build the point."
      : "Training focus: called serve location plus first forehand target under deuce, set-point, and tiebreak scoring.",
    analysisNotes: coachNote
      ? `Mock draft used the coach note as context: ${coachNote}`
      : "Mock draft only. No video frames were processed for this analysis.",
  };
}

export async function POST(request: Request) {
  try {
    await requireAuthenticatedUser();
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
  } catch (error) {
    if (error instanceof SupabaseAuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Unable to generate the prototype analysis." },
      { status: 400 },
    );
  }
}
