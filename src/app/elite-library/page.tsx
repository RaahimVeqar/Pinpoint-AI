"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import {
  elitePressurePatterns,
  type PressureTrigger,
} from "@/lib/mock-data";

const players = ["All", "Federer", "Nadal", "Djokovic", "Alcaraz", "Sinner"] as const;
const pressureTriggers: Array<"All" | PressureTrigger> = [
  "All", "30-30", "Deuce", "Advantage", "Break Point", "Set Point", "Match Point", "Tiebreak",
];

const collectionTargets = [
  { player: "Djokovic", target: 5 },
  { player: "Nadal", target: 5 },
  { player: "Federer", target: 5 },
  { player: "Alcaraz", target: 3 },
  { player: "Sinner", target: 2 },
];

const requiredFields = [
  "ID", "Elite Player", "Opponent", "Match / Tournament", "Year", "Surface", "Set Score",
  "Game Score", "Point Score", "Pressure Trigger", "Timestamp", "Source Link",
  "Serve or Return", "Point Outcome", "First Serve In", "Rally Length", "Primary Pattern",
  "Aggression Level", "Risk Decision", "Shot That Decided Point", "Error / Winner Type",
  "Reset Behavior", "Body Language Note", "Tactical Principle", "Coaching Takeaway",
  "Tags", "Confidence Level", "Notes",
];

type PlayerFilter = (typeof players)[number];

export default function EliteLibraryPage() {
  const [playerFilter, setPlayerFilter] = useState<PlayerFilter>("All");
  const [triggerFilter, setTriggerFilter] = useState<"All" | PressureTrigger>("All");
  const filteredPatterns = useMemo(
    () => elitePressurePatterns.filter((pattern) =>
      (playerFilter === "All" || pattern.player === playerFilter) &&
      (triggerFilter === "All" || pattern.pressureTrigger === triggerFilter)),
    [playerFilter, triggerFilter],
  );
  const targetTotal = collectionTargets.reduce((total, item) => total + item.target, 0);

  return (
    <PageShell
      eyebrow="Benchmark patterns"
      title="Elite Pressure Library"
      description="A structured review set of elite pressure-point examples used as comparison anchors—not a fully trained AI model. Records remain mock samples until their source footage and metadata are verified."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Collection progress</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{elitePressurePatterns.length} <span className="text-base font-medium text-slate-500">of {targetTotal} initial samples</span></p>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">Current entries demonstrate the data model. They do not count as verified real-data collection until the source link, timestamp, score, and interpretation are reviewed.</p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-emerald-600" style={{ width: `${(elitePressurePatterns.length / targetTotal) * 100}%` }} /></div>
      </section>

      <section className="mt-6">
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Filter by player</p>
            <div className="mt-2 flex flex-wrap gap-2">{players.map((player) => <button key={player} type="button" onClick={() => setPlayerFilter(player)} className={`rounded-md border px-3 py-2 text-sm font-medium ${playerFilter === player ? "border-emerald-700 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>{player}</button>)}</div>
          </div>
          <label className="block min-w-56"><span className="text-sm font-semibold text-slate-700">Pressure trigger</span><select value={triggerFilter} onChange={(event) => setTriggerFilter(event.target.value as "All" | PressureTrigger)} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900">{pressureTriggers.map((trigger) => <option key={trigger}>{trigger}</option>)}</select></label>
        </div>
        <p className="mt-4 text-sm text-slate-500">Showing {filteredPatterns.length} of {elitePressurePatterns.length} review records</p>
      </section>

      <div className="mt-4 space-y-4">
        {filteredPatterns.map((pattern) => (
          <article
            key={pattern.id}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
              <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-slate-950">{pattern.player} vs {pattern.opponent}</h2><Badge>{pattern.pressureTrigger}</Badge><Badge tone="green">{pattern.outcome}</Badge></div><p className="mt-2 text-sm text-slate-600">{pattern.match} · {pattern.year} · {pattern.surface}</p></div>
              <div className="text-left text-sm md:text-right"><p className="font-semibold text-slate-900">{pattern.timestamp}</p><p className="mt-1 text-slate-500">{pattern.sourceLabel}</p></div>
            </div>
            <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-4">
              <DataField label="Score context" value={pattern.scoreContext} />
              <DataField label="Serve / return" value={pattern.serveOrReturn} />
              <DataField label="Rally length" value={`${pattern.rallyLength} shots`} />
              <DataField label="Aggression level" value={pattern.aggressionLevel} />
              <DataField label="Primary pattern" value={pattern.primaryPattern} wide />
              <DataField label="Risk decision" value={pattern.riskDecision} wide />
              <DataField label="Tactical principle" value={pattern.tacticalPrinciple} wide />
              <DataField label="Coaching takeaway" value={pattern.coachingTakeaway} wide />
            </dl>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">{pattern.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{tag}</span>)}<span className="ml-auto text-xs font-semibold uppercase tracking-wide text-slate-500">{pattern.confidenceLevel} confidence</span></div>
          </article>
        ))}
        {filteredPatterns.length === 0 && <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No review records match these filters.</div>}
      </div>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Real Data Collection Plan</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">The first verified collection milestone is 20 pressure points. Each point should be reviewed against footage and retain a traceable source before it is used in comparisons.</p>
        <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-950">Dataset Template</p>
          <p className="mt-1 text-sm leading-6 text-emerald-900">Collect real elite points using the CSV schema. The initial target is 20 verified elite pressure points.</p>
          <p className="mt-2 font-mono text-xs text-emerald-800">data/elite-pressure-points-template.csv</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{collectionTargets.map((item) => { const current = elitePressurePatterns.filter((pattern) => pattern.player === item.player).length; return <div key={item.player} className="rounded-md border border-slate-200 bg-slate-50 p-4"><p className="font-semibold text-slate-950">{item.player}</p><p className="mt-1 text-sm text-slate-600">Target: {item.target} points</p><p className="mt-1 text-xs text-slate-500">Mock records: {current}</p></div>; })}</div>
        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">Required fields for every real point</h3>
        <ul className="mt-3 grid gap-x-6 gap-y-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">{requiredFields.map((field) => <li key={field} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />{field}</li>)}</ul>
      </section>
    </PageShell>
  );
}

function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" }) {
  return <span className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${tone === "green" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{children}</span>;
}

function DataField({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={wide ? "xl:col-span-2" : ""}><dt className="font-medium text-slate-500">{label}</dt><dd className="mt-1 leading-6 text-slate-900">{value}</dd></div>;
}
