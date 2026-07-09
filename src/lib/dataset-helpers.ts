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
  const short = points.filter((point) => point.rallyLength !== null && point.rallyLength <= 4).length;
  const sustained = points.filter((point) => point.rallyLength !== null && point.rallyLength >= 8).length;
  const rallyTendency = short > sustained ? "He tends to look for earlier first-strike control when the opening is clear" : sustained > short ? "He is comfortable extending pressure through longer exchanges" : "He can work through both short first-strike windows and longer construction phases";
  const family = getPatternFamilyPhrase(families);
  const behavior = getBehaviorPhrase(points);
  const risk = getRiskPhrase(points);
  const reset = getResetPhrase(points);
  const profile = playerProfiles.find((item) => item.elitePlayer.toLowerCase() === player.toLowerCase());
  const execution = getExecutionPhrase(families, profile);
  const finish = getFinishPhrase(points);
  return `${player}'s pressure profile is built around ${family}. He tends to ${behavior}, with ${risk} and ${reset}. ${execution} ${rallyTendency}, and ${finish}`;
}

function getPatternFamilyPhrase(families: CountedValue[]): string {
  if (families.length > 1 && families[0].count === families[1].count) {
    return "a balanced mix of controlled construction and early initiative";
  }
  if (families[0]?.label.startsWith("Early Initiative")) {
    return "early initiative and first-strike dictation";
  }
  if (families[0]?.label.startsWith("Sustained Pressure")) {
    return "sustained pressure and controlled point construction";
  }
  return "varied pressure patterns";
}

function getBehaviorPhrase(points: ElitePressurePoint[]): string {
  const tags = normalizeTags(points.flatMap((point) => point.tags));
  const tagText = tags.join(" ");
  const has = (pattern: RegExp) => pattern.test(tagText);
  const behaviors = [
    has(/return|neutral/i) ? "absorb the first pressure ball" : "",
    has(/depth|baseline|rally|margin|shape|heavy|pace absorption/i)
      ? "hold depth and margin through the middle of the rally"
      : "",
    has(/serve \+ 1|return \+ 1|first strike|early contact|plus-one/i)
      ? "take the first clear plus-one opportunity"
      : "",
    has(/transition|forecourt|net|volley|approach|forward/i)
      ? "move forward once court position is available"
      : "",
    has(/direction|redirection|open court|line|angle/i)
      ? "change direction after creating a positional opening"
      : "",
  ].filter(Boolean);

  return joinPhrase(behaviors.slice(0, 3)) || "build pressure through repeatable, high-percentage patterns";
}

function getRiskPhrase(points: ElitePressurePoint[]): string {
  const riskText = points.map((point) => point.riskDecision).join(" ").toLowerCase();
  const controlled = (riskText.match(/controlled|safe|margin|low-percentage|does not force|avoid/g) ?? []).length;
  const aggressive = (riskText.match(/aggressive|attacking|accelerat|first-strike|commits/g) ?? []).length;
  const opportunistic = (riskText.match(/opening|opportunity|available|short|clear target|right ball/g) ?? []).length;

  if (controlled >= aggressive && controlled >= opportunistic) return "controlled risk selection";
  if (opportunistic >= aggressive) return "opportunity-based risk selection";
  return "organized attacking risk";
}

function getResetPhrase(points: ElitePressurePoint[]): string {
  const resetText = points.map((point) => point.resetBehavior).join(" ").toLowerCase();
  const calm = (resetText.match(/calm|composed|controlled|walks back|turns back|resets/g) ?? []).length;
  const expressive = (resetText.match(/fist|vocal|celebration|pump|gesture/g) ?? []).length;

  if (calm >= expressive) return "a composed reset between pressure moments";
  return "an emotional release that still returns quickly to the next-point routine";
}

function getExecutionPhrase(
  families: CountedValue[],
  profile:
    | {
        earlyInitiativeExecution?: string;
        sustainedPressureExecution?: string;
      }
    | undefined,
): string {
  const useEarly = families[0]?.label.startsWith("Early Initiative");
  const rawExecution = useEarly
    ? profile?.earlyInitiativeExecution
    : profile?.sustainedPressureExecution;

  if (!rawExecution || /^No approved/i.test(rawExecution)) {
    return "Court position changes only after the rally has produced a usable opening.";
  }

  return rawExecution.replace(/\.$/, ".");
}

function getFinishPhrase(points: ElitePressurePoint[]): string {
  const tags = normalizeTags(points.flatMap((point) => point.tags));
  const tagText = tags.join(" ");
  const forwardFinish = /(finish|net|forward|approach|forecourt|volley)/i.test(tagText);
  const openCourtFinish = /(open court|short ball|winner|direction|redirection|line|angle)/i.test(tagText);

  if (forwardFinish && openCourtFinish) {
    return "his finishing tends to come from forward movement or open-court acceleration rather than a rushed low-margin shot.";
  }
  if (forwardFinish) {
    return "his finishing often comes by converting pressure into forward court position.";
  }
  if (openCourtFinish) {
    return "his finishing usually appears after an opening has been created for acceleration into space.";
  }
  return "his finishing choices follow the pressure he has already built rather than forcing the point early.";
}

function joinPhrase(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
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
