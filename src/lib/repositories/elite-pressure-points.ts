import "server-only";

import { normalizeTags } from "@/lib/dataset-helpers";
import { elitePressurePoints as localElitePressurePoints } from "@/lib/elite-library-data";
import type {
  AggressionLevel,
  ConfidenceLevel,
  ElitePressurePoint,
  PressureTrigger,
  RiskDecision,
  ServeOrReturn,
  Surface,
} from "@/lib/pinpoint-types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ElitePressurePointRow = {
  id: string;
  elite_player: string;
  opponent: string;
  match_tournament: string | null;
  year: number | null;
  surface: string | null;
  set_score: string | null;
  game_score: string | null;
  point_score: string | null;
  pressure_trigger: string;
  timestamp: string | null;
  source_link: string | null;
  clip_file_name: string | null;
  player_to_analyze: string | null;
  server_if_known: string | null;
  uploader_note: string | null;
  serve_or_return: string | null;
  point_outcome: string | null;
  first_serve_in: string | null;
  rally_length: number | null;
  primary_pattern: string;
  aggression_level: string | null;
  risk_decision: string | null;
  shot_that_decided_point: string | null;
  error_or_winner_type: string | null;
  reset_behavior: string | null;
  body_language_note: string | null;
  tactical_principle: string | null;
  coaching_takeaway: string | null;
  tags: string[] | null;
  confidence_level: string;
  ai_notes: string | null;
  review_status: string;
  reviewer_correction: string | null;
  approved_for_library: boolean;
  point_pattern_family: string;
  pattern_hierarchy: string | null;
};

const ELITE_PRESSURE_POINT_COLUMNS = [
  "id",
  "elite_player",
  "opponent",
  "match_tournament",
  "year",
  "surface",
  "set_score",
  "game_score",
  "point_score",
  "pressure_trigger",
  "timestamp",
  "source_link",
  "clip_file_name",
  "player_to_analyze",
  "server_if_known",
  "uploader_note",
  "serve_or_return",
  "point_outcome",
  "first_serve_in",
  "rally_length",
  "primary_pattern",
  "aggression_level",
  "risk_decision",
  "shot_that_decided_point",
  "error_or_winner_type",
  "reset_behavior",
  "body_language_note",
  "tactical_principle",
  "coaching_takeaway",
  "tags",
  "confidence_level",
  "ai_notes",
  "review_status",
  "reviewer_correction",
  "approved_for_library",
  "point_pattern_family",
  "pattern_hierarchy",
].join(",");

let fallbackWarningLogged = false;

export async function getElitePressurePoints(): Promise<ElitePressurePoint[]> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("public")
      .from("elite_pressure_points")
      .select(ELITE_PRESSURE_POINT_COLUMNS)
      .eq("approved_for_library", true)
      .eq("review_status", "Reviewed");

    if (error) {
      logSupabaseError(error);
      return getLocalFallback();
    }

    const rows = (data ?? []) as unknown as ElitePressurePointRow[];
    if (!rows.length) {
      return getLocalFallback();
    }

    return rows.map(mapElitePressurePointRow);
  } catch (error) {
    logSupabaseError(error);
    return getLocalFallback();
  }
}

function logSupabaseError(error: unknown): void {
  if (process.env.NODE_ENV === "production") return;

  const supabaseError = error as Partial<{
    code: unknown;
    message: unknown;
    details: unknown;
    hint: unknown;
  }>;

  console.error("Elite Library Supabase error", {
    code: supabaseError?.code ?? null,
    message: supabaseError?.message ?? null,
    details: supabaseError?.details ?? null,
    hint: supabaseError?.hint ?? null,
  });
}

function mapElitePressurePointRow(
  row: ElitePressurePointRow,
): ElitePressurePoint {
  return {
    id: row.id,
    elitePlayer: row.elite_player.trim(),
    opponent: row.opponent.trim(),
    matchTournament: normalizeText(row.match_tournament),
    year: row.year ?? 0,
    surface: normalizeText(row.surface) as Surface,
    setScore: normalizeText(row.set_score),
    gameScore: normalizeText(row.game_score),
    pointScore: normalizeText(row.point_score),
    pressureTrigger: row.pressure_trigger as PressureTrigger,
    timestamp: normalizeText(row.timestamp),
    sourceLink: normalizeText(row.source_link),
    clipFileName: normalizeText(row.clip_file_name),
    playerToAnalyze: normalizeText(row.player_to_analyze),
    serverIfKnown: normalizeText(row.server_if_known),
    uploaderNote: normalizeText(row.uploader_note),
    serveOrReturn: mapServeOrReturn(row.serve_or_return),
    pointOutcome: normalizeText(row.point_outcome),
    firstServeIn: mapFirstServeIn(row.first_serve_in),
    rallyLength: row.rally_length,
    primaryPattern: row.primary_pattern.trim(),
    aggressionLevel: mapAggressionLevel(row.aggression_level),
    riskDecision: normalizeText(row.risk_decision) as RiskDecision,
    shotThatDecidedPoint: normalizeText(row.shot_that_decided_point),
    errorOrWinnerType: normalizeText(row.error_or_winner_type),
    resetBehavior: normalizeText(row.reset_behavior),
    bodyLanguageNote: normalizeText(row.body_language_note),
    tacticalPrinciple: normalizeText(row.tactical_principle),
    coachingTakeaway: normalizeText(row.coaching_takeaway),
    tags: normalizeTags(row.tags ?? []),
    confidenceLevel: row.confidence_level as ConfidenceLevel,
    aiNotes: normalizeText(row.ai_notes),
    reviewStatus: "Approved",
    reviewerCorrection: normalizeText(row.reviewer_correction),
    approvedForLibrary: row.approved_for_library,
    pointPatternFamily: row.point_pattern_family.trim(),
    patternHierarchy: normalizeText(row.pattern_hierarchy),
  };
}

function normalizeText(value: string | null): string {
  return value?.trim() ?? "";
}

function mapFirstServeIn(value: string | null): boolean | null {
  if (value === "Yes") return true;
  if (value === "No") return false;
  return null;
}

function mapServeOrReturn(value: string | null): ServeOrReturn {
  if (value === "Serve" || value === "Return") return value;
  return "Unknown";
}

function mapAggressionLevel(value: string | null): AggressionLevel {
  if (value === "Medium") return "Balanced";
  if (value === "High" || value === "Medium-High") return "High";
  return "Controlled";
}

function getLocalFallback(): ElitePressurePoint[] {
  if (!fallbackWarningLogged) {
    const message =
      "Elite Library is using the local dataset because Supabase data is unavailable.";

    if (process.env.NODE_ENV === "production") {
      console.error(message);
    } else {
      console.warn(message);
    }

    fallbackWarningLogged = true;
  }

  return localElitePressurePoints;
}
