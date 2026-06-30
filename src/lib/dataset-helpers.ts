import type {
  ConfidenceLevel,
  ElitePressurePoint,
  ReviewStatus,
} from "@/lib/pinpoint-types";

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
  };
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
