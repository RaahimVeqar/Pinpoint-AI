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
  eliteLibraryPlayers,
  eliteLibraryPressureTriggers,
  eliteLibrarySurfaces,
  elitePressurePoints,
} from "@/lib/elite-library-data";
import type { ElitePressurePoint } from "@/lib/pinpoint-types";

const playerOptions = ["All", ...eliteLibraryPlayers];
const triggerOptions = ["All", ...eliteLibraryPressureTriggers];
const surfaceOptions = ["All", ...eliteLibrarySurfaces];
const pointTypeOptions = ["All", "Short point / first strike", "Medium rally", "Long rally"] as const;
const profileOrder = eliteLibraryPlayers;

type PlayerFilter = string;
type TriggerFilter = string;
type SurfaceFilter = string;
type PointTypeFilter = (typeof pointTypeOptions)[number];

export default function EliteLibraryPage() {
  const [playerFilter, setPlayerFilter] = useState<PlayerFilter>("All");
  const [triggerFilter, setTriggerFilter] = useState<TriggerFilter>("All");
  const [surfaceFilter, setSurfaceFilter] = useState<SurfaceFilter>("All");
  const [pointTypeFilter, setPointTypeFilter] = useState<PointTypeFilter>("All");

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
    [playerFilter, pointTypeFilter, surfaceFilter, triggerFilter],
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
      eyebrow="Coaching intelligence"
      title="Elite pressure pattern library"
      description="Observed patterns from reviewed elite clips, organized around repeated pressure behaviors and practical coaching translation."
    >
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 text-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Current reviewed library</p>
            <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight">Point rows are evidence. Repeated behavior is the coaching signal.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Profiles aggregate reviewed observations across pressure moments, while retaining every supporting point for inspection. Short points and long rallies are treated as different tactical windows, not as a value hierarchy.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <Metric value={approvedCount} label="approved points" />
            <Metric value={elitePressurePoints.length} label="reviewed rows" />
            <Metric value={`${approvedPercentage}%`} label="approved" />
          </div>
        </div>
        <div className="h-1 bg-slate-800"><div className="h-full bg-emerald-500" style={{ width: `${approvedPercentage}%` }} /></div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Filter label="Elite player" value={playerFilter} options={playerOptions} onChange={(value) => setPlayerFilter(value as PlayerFilter)} />
          <Filter label="Pressure trigger" value={triggerFilter} options={triggerOptions} onChange={(value) => setTriggerFilter(value as TriggerFilter)} />
          <Filter label="Surface" value={surfaceFilter} options={surfaceOptions} onChange={(value) => setSurfaceFilter(value as SurfaceFilter)} />
          <Filter label="Point type" value={pointTypeFilter} options={pointTypeOptions} onChange={(value) => setPointTypeFilter(value as PointTypeFilter)} />
        </div>
        <p className="mt-4 text-sm text-slate-500">Profiles below reflect {filteredPoints.length} of {elitePressurePoints.length} observations ({visiblePercentage}%).</p>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Pressure profiles</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Repeated pressure behaviors</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Player-level summaries surface recurrence across the current reviewed evidence. Counts indicate observations, not statistical certainty.</p>
        </div>
        <div className="space-y-6">
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
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Observed across reviewed elite clips</p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-950">{player} pressure profile</h3>
        </div>
        <StatusBadge>{summary.approvedPoints} approved / reviewed points</StatusBadge>
      </header>
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
        <section><h4 className="text-base font-semibold text-slate-950">Pressure Tendencies</h4><p className="mt-2 text-sm leading-7 text-slate-700">{summary.pressureTendencies}</p></section>
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Dominant pattern family</p>
          <h4 className="mt-1 font-semibold text-slate-950">{summary.dominantPatternFamily}</h4>
          <div className="mt-3 space-y-2">{summary.patternFamilies.map((family) => <PatternFamilyBar key={family.label} family={family} total={summary.evidencePoints.length} />)}</div>
        </section>
      </div>
      <div className="border-t border-slate-200 bg-emerald-50/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Coaching Takeaway</p>
        <TextList items={summary.coachingTakeaways} columns />
      </div>
      <details className="group border-t border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600">
          <span className="group-open:hidden">View Supporting Evidence</span><span className="hidden group-open:inline">Hide Supporting Evidence</span><span aria-hidden="true" className="text-emerald-700">+</span>
        </summary>
        <div className="border-t border-slate-100 bg-slate-50 p-5">
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
  return <div><div className="flex justify-between gap-3 text-xs text-slate-600"><span>{family.label}</span><span className="font-semibold">{percentage}%</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${percentage}%` }} /></div></div>;
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
    <details className="group rounded-lg border border-slate-200 bg-white shadow-sm">
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
  return <div className="min-w-28 rounded-lg border border-slate-700 bg-slate-900 p-3"><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-slate-400">{label}</p></div>;
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <label><span className="text-sm font-semibold text-slate-700">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function ProfileCell({ title, kicker, children }: { title: string; kicker?: string; children: React.ReactNode }) {
  return <div className="min-h-44 bg-white p-5">{kicker && <p className="text-xs font-medium text-slate-500">{kicker}</p>}<h4 className={`${kicker ? "mt-1" : ""} text-sm font-semibold text-slate-950`}>{title}</h4><div className="mt-3">{children}</div></div>;
}

function CountList({ items, empty = "No repeated observation in this view." }: { items: CountedValue[]; empty?: string }) {
  if (!items.length) return <p className="text-sm text-slate-500">{empty}</p>;
  return <ul className="space-y-2">{items.map((item) => <li key={item.label} className="flex items-start justify-between gap-3 text-sm leading-5 text-slate-700"><span>{item.label}</span><span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{item.count}×</span></li>)}</ul>;
}

function TextList({ items, columns = false }: { items: string[]; columns?: boolean }) {
  if (!items.length) return <p className="text-sm text-slate-500">No reviewed observation in this view.</p>;
  return <ul className={`${columns ? "mt-3 grid gap-3 md:grid-cols-2" : "space-y-2"}`}>{items.map((item) => <li key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-700"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />{item}</li>)}</ul>;
}

function TagList({ items }: { items: string[] }) {
  return <div className="flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{item}</span>)}</div>;
}

function StatusBadge({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "slate" | "amber" }) {
  const tones = { green: "bg-emerald-100 text-emerald-800", slate: "bg-slate-200 text-slate-700", amber: "bg-amber-100 text-amber-800" };
  return <span className={`rounded-full px-2.5 py-1 ${tones[tone]}`}>{children}</span>;
}

function DataField({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={wide ? "xl:col-span-2" : ""}><dt className="font-medium text-slate-500">{label}</dt><dd className="mt-1 leading-6 text-slate-900">{value}</dd></div>;
}

function EmptyState() {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No elite observations match these filters.</div>;
}
