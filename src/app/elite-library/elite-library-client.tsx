"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import {
  getApprovedEliteLibraryPoints,
  getPlayerPressureSummary,
  groupElitePointsByPlayer,
  type CountedValue,
} from "@/lib/dataset-helpers";
import {
  type ElitePressurePoint,
  type Surface,
} from "@/lib/pinpoint-types";

const pointTypeOptions = ["All", "Short point / first strike", "Medium rally", "Long rally"] as const;

type PlayerFilter = string;
type TriggerFilter = string;
type SurfaceFilter = string;
type PointTypeFilter = (typeof pointTypeOptions)[number];

export function EliteLibraryClient({
  elitePressurePoints,
}: {
  elitePressurePoints: ElitePressurePoint[];
}) {
  const [playerFilter, setPlayerFilter] = useState<PlayerFilter>("All");
  const [triggerFilter, setTriggerFilter] = useState<TriggerFilter>("All");
  const [surfaceFilter, setSurfaceFilter] = useState<SurfaceFilter>("All");
  const [pointTypeFilter, setPointTypeFilter] = useState<PointTypeFilter>("All");

  const eliteLibraryPlayers = useMemo(
    () => uniqueValues(elitePressurePoints.map((point) => point.elitePlayer)),
    [elitePressurePoints],
  );
  const eliteLibraryPressureTriggers = useMemo(
    () => uniqueValues(elitePressurePoints.map((point) => point.pressureTrigger)),
    [elitePressurePoints],
  );
  const eliteLibrarySurfaces = useMemo(
    () => uniqueValues(elitePressurePoints.map((point) => point.surface)) as Surface[],
    [elitePressurePoints],
  );
  const playerOptions = ["All", ...eliteLibraryPlayers];
  const triggerOptions = ["All", ...eliteLibraryPressureTriggers];
  const surfaceOptions = ["All", ...eliteLibrarySurfaces];
  const profileOrder = eliteLibraryPlayers;

  const filteredPoints = useMemo(
    () => elitePressurePoints.filter((point) => {
      const rallyMatches =
        pointTypeFilter === "All" ||
        (pointTypeFilter === "Short point / first strike" && point.rallyLength !== null && point.rallyLength <= 4) ||
        (pointTypeFilter === "Medium rally" && point.rallyLength !== null && point.rallyLength >= 5 && point.rallyLength <= 7) ||
        (pointTypeFilter === "Long rally" && point.rallyLength !== null && point.rallyLength >= 8);

      return (
        (playerFilter === "All" || point.elitePlayer === playerFilter) &&
        (triggerFilter === "All" || point.pressureTrigger === triggerFilter) &&
        (surfaceFilter === "All" || point.surface === surfaceFilter) &&
        rallyMatches
      );
    }),
    [elitePressurePoints, playerFilter, pointTypeFilter, surfaceFilter, triggerFilter],
  );

  const groupedPoints = groupElitePointsByPlayer(filteredPoints);
  const visiblePlayers = profileOrder.filter((player) => groupedPoints[player]?.length);
  const approvedCount = getApprovedEliteLibraryPoints(elitePressurePoints).length;
  const approvedPercentage = elitePressurePoints.length
    ? Math.round((approvedCount / elitePressurePoints.length) * 100)
    : 0;
  const visiblePercentage = elitePressurePoints.length
    ? Math.round((filteredPoints.length / elitePressurePoints.length) * 100)
    : 0;

  return (
    <PageShell
      eyebrow="Scouting and coaching intelligence"
      title="Elite Library"
      description="Reviewed pressure patterns, grouped by player and translated into practical coaching decisions. Counts describe the current evidence—not statistical certainty."
    >
      <section className="elite-intro">
        <div className="elite-intro__content">
          <div>
            <p>Current reviewed library</p>
            <h2>Point rows are evidence. Repeated behavior is the coaching signal.</h2>
            <span>Profiles aggregate reviewed pressure moments while retaining each supporting point for inspection.</span>
          </div>
          <dl className="elite-intro__metrics">
            <Metric value={approvedCount} label="approved points" />
            <Metric value={elitePressurePoints.length} label="reviewed rows" />
            <Metric value={`${approvedPercentage}%`} label="approved" />
          </dl>
        </div>
      </section>

      <section className="surface elite-filters" aria-labelledby="filter-heading">
        <div className="elite-filters__head">
          <div><h2 id="filter-heading">Shape the comparison</h2><p>Select a player first, then narrow the evidence by pressure context.</p></div>
          <span>{filteredPoints.length} of {elitePressurePoints.length} observations · {visiblePercentage}%</span>
        </div>
        <div className="elite-filters__grid">
          <Filter label="Elite player" value={playerFilter} options={playerOptions} onChange={(value) => setPlayerFilter(value as PlayerFilter)} />
          <Filter label="Pressure trigger" value={triggerFilter} options={triggerOptions} onChange={(value) => setTriggerFilter(value as TriggerFilter)} />
          <Filter label="Surface" value={surfaceFilter} options={surfaceOptions} onChange={(value) => setSurfaceFilter(value as SurfaceFilter)} />
          <Filter label="Point type" value={pointTypeFilter} options={pointTypeOptions} onChange={(value) => setPointTypeFilter(value as PointTypeFilter)} />
        </div>
      </section>

      <section className="elite-profiles">
        <div className="elite-profiles__head">
          <h2>Repeated pressure behaviors</h2>
          <p>Read the profile first. Open supporting evidence only when you need to inspect the observations behind it.</p>
        </div>
        <div className="elite-profiles__list">
          {visiblePlayers.map((player) => (
            <PressureProfile key={player} points={filteredPoints} player={player} />
          ))}
          {!visiblePlayers.length && <EmptyState />}
        </div>
      </section>

    </PageShell>
  );
}

function PressureProfile({ points, player }: { points: ElitePressurePoint[]; player: string }) {
  const summary = getPlayerPressureSummary(points, player);

  return (
    <article className="surface elite-profile">
      <header className="elite-profile__header">
        <div>
          <p>Observed across reviewed elite clips</p>
          <h3>{player}</h3>
          <span>Pressure profile</span>
        </div>
        <StatusBadge>{summary.approvedPoints} approved / reviewed points</StatusBadge>
      </header>
      <div className="elite-profile__body">
        <section className="elite-profile__tendency"><h4>Pressure Tendencies</h4><p>{summary.pressureTendencies}</p></section>
        <section className="pattern-split">
          <p>Pattern-family split</p>
          <h4>{summary.dominantPatternFamily}</h4>
          <div>{summary.patternFamilies.map((family) => <PatternFamilyBar key={family.label} family={family} total={summary.evidencePoints.length} />)}</div>
        </section>
      </div>
      <div className="elite-takeaway">
        <p>Coaching Takeaway</p>
        <TextList items={summary.coachingTakeaways} columns />
      </div>
      <details className="group elite-evidence">
        <summary>
          <span className="group-open:hidden">View Supporting Evidence</span><span className="hidden group-open:inline">Hide Supporting Evidence</span><span aria-hidden="true">+</span>
        </summary>
        <div className="detail-body elite-evidence__body">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Supporting Evidence · Current reviewed MVP library</p>
          <div className="mt-4 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 lg:grid-cols-3">
            <ProfileCell title="Pressure triggers"><CountList items={summary.pressureTriggers} /></ProfileCell>
            <ProfileCell title="Primary patterns"><CountList items={summary.topPatterns} /></ProfileCell>
            <ProfileCell title="Tags"><TagList items={summary.tags} /></ProfileCell>
            <ProfileCell title="Short-point evidence" kicker="4 shots or fewer"><CountList items={summary.shortPointPatterns} empty="No short-point observation in this view." /></ProfileCell>
            <ProfileCell title="Medium-rally evidence" kicker="5–7 shots"><CountList items={getRallyPatterns(summary.evidencePoints, 5, 7)} empty="No medium-rally observation in this view." /></ProfileCell>
            <ProfileCell title="Long-rally evidence" kicker="8 shots or more"><CountList items={summary.longRallyPatterns} empty="No long-rally observation in this view." /></ProfileCell>
            <ProfileCell title="Tactical principles"><TextList items={summary.tacticalPrinciples} /></ProfileCell>
          </div>
          {/* As the dataset grows, the UI should later show representative examples and filtered evidence rather than every point by default. */}
          <div className="mt-5 space-y-3">{summary.evidencePoints.map((point) => <EvidenceRow key={point.id} point={point} />)}</div>
        </div>
      </details>
    </article>
  );
}

function PatternFamilyBar({ family, total }: { family: CountedValue; total: number }) {
  const percentage = total ? Math.round((family.count / total) * 100) : 0;
  return <div className="pattern-bar"><div><span>{family.label}</span><strong className="tabular">{percentage}%</strong></div><div><span style={{ width: `${percentage}%` }} /></div></div>;
}

function getRallyPatterns(points: ElitePressurePoint[], minimum: number, maximum: number): CountedValue[] {
  const counts = new Map<string, CountedValue>();
  points.filter((point) => point.rallyLength !== null && point.rallyLength >= minimum && point.rallyLength <= maximum).forEach((point) => {
    const current = counts.get(point.primaryPattern);
    counts.set(point.primaryPattern, { label: point.primaryPattern, count: (current?.count ?? 0) + 1 });
  });
  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}

function EvidenceRow({ point }: { point: ElitePressurePoint }) {
  const matchSource = [point.matchTournament, point.year ? String(point.year) : "", point.uploaderNote]
    .filter(Boolean)
    .join(" · ");

  return (
    <details className="group rounded-lg border border-slate-200 bg-white">
      <summary className="flex cursor-pointer list-none flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-950">{point.elitePlayer}</span>
            <StatusBadge tone="slate">{point.pressureTrigger}</StatusBadge>
            <StatusBadge tone={point.reviewStatus === "Approved" ? "green" : "amber"}>{point.reviewStatus}</StatusBadge>
          </div>
          <p className="mt-2 text-sm text-slate-700">{point.primaryPattern}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>{point.surface}</span><span>{point.rallyLength ?? "—"} shots</span><span>{point.confidenceLevel} confidence</span><span className="font-semibold text-emerald-700 group-open:hidden">View evidence</span>
        </div>
      </summary>
      <dl className="grid gap-5 border-t border-slate-100 bg-slate-50 p-5 text-sm md:grid-cols-2 xl:grid-cols-4">
        <DataField label="Match / source status" value={matchSource} wide />
        <DataField label="Serve / return" value={point.serveOrReturn} />
        <DataField label="Point outcome" value={point.pointOutcome} />
        <DataField label="Tactical principle" value={point.tacticalPrinciple} wide />
        <DataField label="Coaching translation" value={point.coachingTakeaway} wide />
        <DataField label="Reset behavior" value={point.resetBehavior} wide />
        <DataField label="Reviewer note" value={point.reviewerCorrection} wide />
      </dl>
    </details>
  );
}

function Metric({ value, label }: { value: number | string; label: string }) {
  return <div><dd className="tabular">{value}</dd><dt>{label}</dt></div>;
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <label><span className="field-label">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="field-control">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function ProfileCell({ title, kicker, children }: { title: string; kicker?: string; children: React.ReactNode }) {
  return <div className="min-h-44 bg-white p-5">{kicker && <p className="text-xs font-medium text-slate-600">{kicker}</p>}<h4 className={`${kicker ? "mt-1" : ""} text-sm font-semibold text-slate-950`}>{title}</h4><div className="mt-3">{children}</div></div>;
}

function CountList({ items, empty = "No repeated observation in this view." }: { items: CountedValue[]; empty?: string }) {
  if (!items.length) return <p className="text-sm text-slate-600">{empty}</p>;
  return <ul className="space-y-2">{items.map((item) => <li key={item.label} className="flex items-start justify-between gap-3 text-sm leading-5 text-slate-700"><span>{item.label}</span><span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{item.count}×</span></li>)}</ul>;
}

function TextList({ items, columns = false }: { items: string[]; columns?: boolean }) {
  if (!items.length) return <p className="text-list-empty">No reviewed observation in this view.</p>;
  return <ul className={`${columns ? "mt-3 grid gap-3 md:grid-cols-2" : "space-y-2"} text-list`}>{items.map((item) => <li key={item}><span aria-hidden="true" />{item}</li>)}</ul>;
}

function TagList({ items }: { items: string[] }) {
  return <div className="flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{item}</span>)}</div>;
}

function StatusBadge({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "slate" | "amber" }) {
  const tones = { green: "status-success", slate: "status-neutral", amber: "status-warning" };
  return <span className={`status ${tones[tone]}`}>{children}</span>;
}

function DataField({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={wide ? "xl:col-span-2" : ""}><dt className="font-medium text-slate-500">{label}</dt><dd className="mt-1 leading-6 text-slate-900">{value}</dd></div>;
}

function EmptyState() {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No elite observations match these filters.</div>;
}

function uniqueValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
