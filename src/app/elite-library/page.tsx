"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import {
  getApprovedEliteLibraryPoints,
  getPlayerPressureSummary,
  groupElitePointsByPlayer,
  type CountedValue,
} from "@/lib/dataset-helpers";
import { elitePressurePatterns } from "@/lib/mock-data";
import type {
  ElitePressurePoint,
  PressureTrigger,
  Surface,
} from "@/lib/pinpoint-types";

const playerOptions = ["All", "Djokovic", "Nadal", "Federer", "Alcaraz", "Sinner"] as const;
const triggerOptions: Array<"All" | PressureTrigger> = [
  "All", "30-30", "Deuce", "Advantage", "Break Point", "Set Point", "Match Point", "Tiebreak",
];
const surfaceOptions: Array<"All" | Surface> = ["All", "Hard", "Clay", "Grass", "Indoor Hard"];
const pointTypeOptions = ["All", "Short point / first strike", "Medium rally", "Long rally"] as const;
const profileOrder = ["Djokovic", "Nadal", "Federer", "Alcaraz", "Sinner"];

type PlayerFilter = (typeof playerOptions)[number];
type PointTypeFilter = (typeof pointTypeOptions)[number];

export default function EliteLibraryPage() {
  const [playerFilter, setPlayerFilter] = useState<PlayerFilter>("All");
  const [triggerFilter, setTriggerFilter] = useState<"All" | PressureTrigger>("All");
  const [surfaceFilter, setSurfaceFilter] = useState<"All" | Surface>("All");
  const [pointTypeFilter, setPointTypeFilter] = useState<PointTypeFilter>("All");

  const filteredPoints = useMemo(
    () => elitePressurePatterns.filter((point) => {
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
  const approvedCount = getApprovedEliteLibraryPoints(elitePressurePatterns).length;

  return (
    <PageShell
      eyebrow="Coaching intelligence"
      title="Elite pressure pattern library"
      description="Observed patterns from reviewed elite clips, organized around repeated pressure behaviors and practical coaching translation. Current records are mock samples for product development, not definitive player conclusions."
    >
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 text-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Current reviewed library</p>
            <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight">Point rows are evidence. Repeated behavior is the coaching signal.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Profiles aggregate reviewed observations across pressure moments, while retaining every supporting point for inspection. Short points and long rallies are treated as different tactical windows, not as a value hierarchy.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <Metric value={approvedCount} label="approved samples" />
            <Metric value={elitePressurePatterns.length} label="sample rows" />
          </div>
        </div>
        <div className="h-1 bg-slate-800"><div className="h-full bg-emerald-500" style={{ width: `${(approvedCount / elitePressurePatterns.length) * 100}%` }} /></div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Filter label="Elite player" value={playerFilter} options={playerOptions} onChange={(value) => setPlayerFilter(value as PlayerFilter)} />
          <Filter label="Pressure trigger" value={triggerFilter} options={triggerOptions} onChange={(value) => setTriggerFilter(value as "All" | PressureTrigger)} />
          <Filter label="Surface" value={surfaceFilter} options={surfaceOptions} onChange={(value) => setSurfaceFilter(value as "All" | Surface)} />
          <Filter label="Point type" value={pointTypeFilter} options={pointTypeOptions} onChange={(value) => setPointTypeFilter(value as PointTypeFilter)} />
        </div>
        <p className="mt-4 text-sm text-slate-500">Profiles below reflect {filteredPoints.length} matching sample observations. Approved rows are preferred whenever available.</p>
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

      <section className="mt-10 border-t border-slate-200 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Supporting evidence</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">Individual elite pressure-point rows</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Open a record to inspect the point-level observation behind the profiles. These are realistic mock/sample records pending replacement with verified MVP clips.</p>
        <div className="mt-4 space-y-3">
          {filteredPoints.map((point) => <EvidenceRow key={point.id} point={point} />)}
          {!filteredPoints.length && <EmptyState />}
        </div>
      </section>
    </PageShell>
  );
}

function PressureProfile({ points, player }: { points: ElitePressurePoint[]; player: string }) {
  const summary = getPlayerPressureSummary(points, player);
  const statusText = summary.reviewStatuses["In Review"]
    ? `${summary.reviewStatuses["In Review"]} awaiting review`
    : "All matching rows reviewed";

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Observed across reviewed elite clips</p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-950">{player} pressure profile</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <StatusBadge>{summary.approvedPoints} approved</StatusBadge>
          <StatusBadge tone="slate">{summary.highConfidencePoints} high confidence</StatusBadge>
          <StatusBadge tone="slate">{statusText}</StatusBadge>
        </div>
      </header>
      <div className="grid gap-px bg-slate-200 lg:grid-cols-3">
        <ProfileCell title="Most common pressure triggers"><CountList items={summary.pressureTriggers} /></ProfileCell>
        <ProfileCell title="Primary pressure patterns"><CountList items={summary.topPatterns} /></ProfileCell>
        <ProfileCell title="Common tags"><TagList items={summary.tags} /></ProfileCell>
        <ProfileCell title="First-strike tendency" kicker="Short points · 4 shots or fewer"><CountList items={summary.shortPointPatterns} empty="No short-point observation in this view." /></ProfileCell>
        <ProfileCell title="Long-rally pressure pattern" kicker="Long rallies · 8 shots or more"><CountList items={summary.longRallyPatterns} empty="No long-rally observation in this view." /></ProfileCell>
        <ProfileCell title="Tactical principles"><TextList items={summary.tacticalPrinciples} /></ProfileCell>
      </div>
      <div className="border-t border-slate-200 bg-emerald-50/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Coaching translation</p>
        <TextList items={summary.coachingTakeaways} columns />
      </div>
    </article>
  );
}

function EvidenceRow({ point }: { point: ElitePressurePoint }) {
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
        <DataField label="Match / source status" value={`${point.matchTournament} · ${point.uploaderNote}`} wide />
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

function Metric({ value, label }: { value: number; label: string }) {
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
  return <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No sample observations match these filters.</div>;
}
