import rawElitePressurePoints from "../../data/elite-pressure-points.json";
import { normalizeTags } from "@/lib/dataset-helpers";
import {
  CONFIDENCE_LEVELS,
  type AggressionLevel,
  type ElitePressurePoint,
  type PressureTrigger,
  type ReviewStatus,
  type Surface,
} from "@/lib/pinpoint-types";

const VALID_PATTERN_FAMILIES = [
  "Sustained Pressure / Controlled Construction",
  "Early Initiative / First-Strike Dictation",
] as const;

type RawElitePressurePoint = (typeof rawElitePressurePoints)[number];

function mapAggressionLevel(value: string): AggressionLevel {
  if (value === "Medium") return "Balanced";
  return value === "High" || value === "Medium-High" ? "High" : "Controlled";
}

function normalizeText(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function mapElitePressurePoint(point: RawElitePressurePoint): ElitePressurePoint {
  return {
    ...point,
    elitePlayer: normalizeText(point.elitePlayer),
    opponent: normalizeText(point.opponent),
    matchTournament: normalizeText(point.matchTournament),
    setScore: normalizeText(point.setScore),
    gameScore: normalizeText(point.gameScore),
    pointScore: normalizeText(point.pointScore),
    timestamp: normalizeText(point.timestamp),
    sourceLink: normalizeText(point.sourceLink),
    clipFileName: normalizeText(point.clipFileName),
    playerToAnalyze: normalizeText(point.playerToAnalyze),
    serverIfKnown: normalizeText(point.serverIfKnown),
    uploaderNote: normalizeText(point.uploaderNote),
    pointOutcome: normalizeText(point.pointOutcome),
    shotThatDecidedPoint: normalizeText(point.shotThatDecidedPoint),
    errorOrWinnerType: normalizeText(point.errorOrWinnerType),
    resetBehavior: normalizeText(point.resetBehavior),
    bodyLanguageNote: normalizeText(point.bodyLanguageNote),
    tacticalPrinciple: normalizeText(point.tacticalPrinciple),
    coachingTakeaway: normalizeText(point.coachingTakeaway),
    aiNotes: normalizeText(point.aiNotes),
    reviewerCorrection: normalizeText(point.reviewerCorrection),
    pointPatternFamily: normalizeText(point.pointPatternFamily),
    patternHierarchy: normalizeText(point.patternHierarchy),
    pressureTrigger: point.pressureTrigger as PressureTrigger,
    firstServeIn:
      point.firstServeIn === "Yes" ? true : point.firstServeIn === "No" ? false : null,
    aggressionLevel: mapAggressionLevel(point.aggressionLevel),
    reviewStatus: (point.reviewStatus === "Reviewed"
      ? "Approved"
      : point.reviewStatus) as ReviewStatus,
    tags: normalizeTags(point.tags),
  } as ElitePressurePoint;
}

function validateElitePressurePoints(points: RawElitePressurePoint[]): void {
  const ids = new Set(points.map((point) => point.id));
  const validConfidenceLevels = new Set<string>(CONFIDENCE_LEVELS);
  const validPatternFamilies = new Set<string>(VALID_PATTERN_FAMILIES);

  const checks: Array<[boolean, string]> = [
    [points.length === 20, `expected 20 rows, received ${points.length}`],
    [ids.size === points.length, "IDs must be unique"],
    [points.every((point) => point.reviewStatus === "Reviewed"), "all rows must be reviewed"],
    [points.every((point) => point.approvedForLibrary === true), "all rows must be approved"],
    [points.every((point) => typeof point.rallyLength === "number" && Number.isFinite(point.rallyLength)), "all rally lengths must be numeric"],
    [points.every((point) => typeof point.year === "number" && Number.isFinite(point.year)), "all years must be numeric"],
    [points.every((point) => typeof point.id === "string" && point.id.trim().length > 0), "all rows must have an ID"],
    [points.every((point) => typeof point.elitePlayer === "string" && point.elitePlayer.trim().length > 0), "all rows must have an elite player"],
    [points.every((point) => typeof point.primaryPattern === "string" && point.primaryPattern.trim().length > 0), "all rows must have a primary pattern"],
    [points.every((point) => typeof point.pointPatternFamily === "string" && point.pointPatternFamily.trim().length > 0), "all rows must have a pattern family"],
    [points.every((point) => typeof point.patternHierarchy === "string" && point.patternHierarchy.trim().length > 0), "all rows must have a pattern hierarchy"],
    [points.every((point) => typeof point.pressureTrigger === "string" && point.pressureTrigger.trim().length > 0), "all rows must have a pressure trigger"],
    [points.every((point) => validConfidenceLevels.has(point.confidenceLevel)), "invalid confidence level"],
    [points.every((point) => validPatternFamilies.has(point.pointPatternFamily)), "invalid pattern family"],
    [points.every((point) => point.patternHierarchy.startsWith(point.pointPatternFamily)), "pattern hierarchy must start with its family"],
  ];

  const failures = checks.filter(([valid]) => !valid).map(([, message]) => message);
  if (failures.length) {
    throw new Error(`Invalid elite pressure-point dataset: ${failures.join("; ")}`);
  }
}

validateElitePressurePoints(rawElitePressurePoints);

export const elitePressurePoints: ElitePressurePoint[] =
  rawElitePressurePoints.map(mapElitePressurePoint);

function uniqueValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

export const eliteLibraryPlayers = uniqueValues(
  elitePressurePoints.map((point) => point.elitePlayer),
);

export const eliteLibraryPressureTriggers = uniqueValues(
  elitePressurePoints.map((point) => point.pressureTrigger),
);

export const eliteLibrarySurfaces = uniqueValues(
  elitePressurePoints.map((point) => point.surface),
) as Surface[];
