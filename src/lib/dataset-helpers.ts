import type { ElitePressurePoint } from "@/lib/pinpoint-types";

export function normalizeTags(input: string | string[]): string[] {
  const tags = Array.isArray(input) ? input : input.split(",");

  return Array.from(
    new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)),
  );
}

export function isApprovedElitePoint(point: ElitePressurePoint): boolean {
  return point.reviewStatus === "Approved" && point.approvedForLibrary;
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
    (point) =>
      point.pressureTrigger.trim().toLowerCase() === normalizedTrigger,
  );
}

export function getPrimaryPatterns(points: ElitePressurePoint[]): string[] {
  return Array.from(
    new Set(points.map((point) => point.primaryPattern.trim()).filter(Boolean)),
  );
}
