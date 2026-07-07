import type {
  ConfidenceLevel,
  ElitePressurePoint,
  ReviewStatus,
} from "@/lib/pinpoint-types";
import playerProfiles from "../../data/elite-player-pressure-profiles.json";

export type CountedValue = { label: string; count: number };

export type PlayerPressureSummary = {
  player: string;
  evidencePoints: ElitePressurePoint[];
  totalPoints: number;
  approvedPoints: number;
  highConfidencePoints: number;
  reviewStatuses: Record<ReviewStatus, number>;
  pressureTriggers: CountedValue[];
  topPatterns: CountedValue[];
  shortPointPatterns: CountedValue[];
  longRallyPatterns: CountedValue[];
  tacticalPrinciples: string[];
  coachingTakeaways: string[];
  tags: string[];
  patternFamilies: CountedValue[];
  dominantPatternFamily: string;
  pressureTendencies: string;
};

const confidenceRank: Record<ConfidenceLevel, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export function normalizeTags(input: string | string[]): string[] {
  const tags = Array.isArray(input) ? input : input.split(",");
  return Array.from(
    new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)),
  );
}

export function isApprovedElitePoint(point: ElitePressurePoint): boolean {
  return point.reviewStatus === "Approved" && point.approvedForLibrary;
}

export function getApprovedEliteLibraryPoints(
  points: ElitePressurePoint[],
): ElitePressurePoint[] {
  return sortByConfidence(points.filter(isApprovedElitePoint));
}

export function groupElitePointsByPlayer(
  points: ElitePressurePoint[],
): Record<string, ElitePressurePoint[]> {
  return points.reduce<Record<string, ElitePressurePoint[]>>((groups, point) => {
    const player = point.elitePlayer.trim();
    if (player) groups[player] = [...(groups[player] ?? []), point];
    return groups;
  }, {});
}

export function getElitePointsByPlayer(
  points: ElitePressurePoint[],
  player: string,
): ElitePressurePoint[] {
  const normalizedPlayer = player.trim().toLowerCase();
  return points.filter(
    (point) => point.elitePlayer.trim().toLowerCase() === normalizedPlayer,
  );
}

export function getElitePointsByPressureTrigger(
  points: ElitePressurePoint[],
  trigger: string,
): ElitePressurePoint[] {
  const normalizedTrigger = trigger.trim().toLowerCase();
  return points.filter(
    (point) => point.pressureTrigger.toLowerCase() === normalizedTrigger,
  );
}

export function getPrimaryPatterns(points: ElitePressurePoint[]): string[] {
  return uniqueStrings(points.map((point) => point.primaryPattern));
}

export function getTopPatternsForPlayer(
  points: ElitePressurePoint[],
  player: string,
): CountedValue[] {
  return countValues(getPreferredPlayerPoints(points, player), "primaryPattern");
}

export function getPressureTriggersForPlayer(
  points: ElitePressurePoint[],
  player: string,
): CountedValue[] {
  return countValues(getPreferredPlayerPoints(points, player), "pressureTrigger");
}

export function getTacticalPrinciplesForPlayer(
  points: ElitePressurePoint[],
  player: string,
): string[] {
  return uniqueStrings(
    getPreferredPlayerPoints(points, player).map((point) => point.tacticalPrinciple),
  );
}

export function getCoachingTakeawaysForPlayer(
  points: ElitePressurePoint[],
  player: string,
): string[] {
  return uniqueStrings(
    getPreferredPlayerPoints(points, player).map((point) => point.coachingTakeaway),
  );
}

export function getTagsForPlayer(
  points: ElitePressurePoint[],
  player: string,
): string[] {
  return normalizeTags(
    getPreferredPlayerPoints(points, player).flatMap((point) => point.tags),
  );
}

export function getShortPointPatternsForPlayer(
  points: ElitePressurePoint[],
  player: string,
): CountedValue[] {
  return countValues(
    getPreferredPlayerPoints(points, player).filter(
      (point) => point.rallyLength !== null && point.rallyLength <= 4,
    ),
    "primaryPattern",
  );
}

export function getLongRallyPatternsForPlayer(
  points: ElitePressurePoint[],
  player: string,
): CountedValue[] {
  return countValues(
    getPreferredPlayerPoints(points, player).filter(
      (point) => point.rallyLength !== null && point.rallyLength >= 8,
    ),
    "primaryPattern",
  );
}

export function getPlayerPressureSummary(
  points: ElitePressurePoint[],
  player: string,
): PlayerPressureSummary {
  const playerPoints = getElitePointsByPlayer(points, player);
  const evidencePoints = getPreferredPlayerPoints(points, player);
  const reviewStatuses: Record<ReviewStatus, number> = {
    Draft: 0,
    "In Review": 0,
    "Needs Review": 0,
    Approved: 0,
    Rejected: 0,
  };
  playerPoints.forEach((point) => {
    reviewStatuses[point.reviewStatus] += 1;
  });
  const patternFamilies = countValues(evidencePoints, "pointPatternFamily");

  return {
    player,
    evidencePoints,
    totalPoints: playerPoints.length,
    approvedPoints: playerPoints.filter(isApprovedElitePoint).length,
    highConfidencePoints: evidencePoints.filter(
      (point) => point.confidenceLevel === "High",
    ).length,
    reviewStatuses,
    pressureTriggers: getPressureTriggersForPlayer(points, player),
    topPatterns: getTopPatternsForPlayer(points, player),
    shortPointPatterns: getShortPointPatternsForPlayer(points, player),
    longRallyPatterns: getLongRallyPatternsForPlayer(points, player),
    tacticalPrinciples: getTacticalPrinciplesForPlayer(points, player),
    coachingTakeaways: getCoachingTakeawaysForPlayer(points, player),
    tags: getTagsForPlayer(points, player),
    patternFamilies,
    dominantPatternFamily:
      patternFamilies.length > 1 && patternFamilies[0].count === patternFamilies[1].count
        ? "Balanced in current library"
        : (patternFamilies[0]?.label ?? "No reviewed pattern family"),
    pressureTendencies: getPressureTendencies(evidencePoints, player),
  };
}

/** Builds a concise profile from reviewed point-level observations. */
export function getPressureTendencies(points: ElitePressurePoint[], player: string): string {
  if (!points.length) return `No reviewed pressure tendencies are available for ${player} in this view.`;
  const families = countValues(points, "pointPatternFamily");
  const risks = countValues(points, "riskDecision");
  const patterns = countValues(points, "primaryPattern");
  const short = points.filter((point) => point.rallyLength !== null && point.rallyLength <= 4).length;
  const sustained = points.filter((point) => point.rallyLength !== null && point.rallyLength >= 8).length;
  const rallyTendency = short > sustained ? "The reviewed sample leans toward short, first-strike points" : sustained > short ? "The reviewed sample leans toward sustained rallies" : "The reviewed sample is balanced between short points and sustained rallies";
  const family = families.length > 1 && families[0].count === families[1].count ? "a balanced mix of controlled construction and early initiative" : families[0]?.label.toLowerCase() ?? "varied pressure patterns";
  const behavior = patterns.slice(0, 2).map((item) => item.label.toLowerCase()).join(" and ");
  const profile = playerProfiles.find((item) => item.elitePlayer.toLowerCase() === player.toLowerCase());
  const execution = families[0]?.label.startsWith("Early Initiative")
    ? profile?.earlyInitiativeExecution
    : profile?.sustainedPressureExecution;
  const finishingTags = normalizeTags(points.flatMap((point) => point.tags)).filter((tag) => /(finish|net|forward|approach|winner|open court|short ball|volley)/i.test(tag));
  const finish = finishingTags.length ? `Finishing evidence most often points to ${finishingTags.slice(0, 2).join(" and ")}.` : "Finishing choices follow the opening created rather than forcing an immediate low-percentage strike.";
  return `${player} most often shows ${family} under pressure, repeatedly using ${behavior || "controlled point construction"}. ${execution ?? "Court position changes when the rally creates a usable opening."} Risk decisions are predominantly ${risks[0]?.label.toLowerCase() ?? "calculated"}; ${rallyTendency.toLowerCase()}. ${finish}`;
}

function getPreferredPlayerPoints(
  points: ElitePressurePoint[],
  player: string,
): ElitePressurePoint[] {
  const playerPoints = getElitePointsByPlayer(points, player);
  const approvedPoints = playerPoints.filter(isApprovedElitePoint);
  return sortByConfidence(approvedPoints.length ? approvedPoints : playerPoints);
}

function sortByConfidence(points: ElitePressurePoint[]): ElitePressurePoint[] {
  return [...points].sort(
    (a, b) => confidenceRank[b.confidenceLevel] - confidenceRank[a.confidenceLevel],
  );
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  return values.reduce<string[]>((result, value) => {
    const cleanValue = value.trim();
    const key = cleanValue.toLowerCase();
    if (cleanValue && !seen.has(key)) {
      seen.add(key);
      result.push(cleanValue);
    }
    return result;
  }, []);
}

function countValues<K extends keyof ElitePressurePoint>(
  points: ElitePressurePoint[],
  key: K,
): CountedValue[] {
  const counts = new Map<string, CountedValue>();
  points.forEach((point) => {
    const value = String(point[key]).trim();
    if (!value) return;
    const normalized = value.toLowerCase();
    const current = counts.get(normalized);
    counts.set(normalized, {
      label: current?.label ?? value,
      count: (current?.count ?? 0) + 1,
    });
  });
  return Array.from(counts.values()).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );
}
