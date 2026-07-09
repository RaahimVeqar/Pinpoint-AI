"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import {
  matchSessions,
  players,
  pressurePoints,
  reportSummaries,
} from "@/lib/mock-data";

export default function ReportsPage() {
  const [selectedReportId, setSelectedReportId] = useState(reportSummaries[0].id);
  const report =
    reportSummaries.find((item) => item.id === selectedReportId) ??
    reportSummaries[0];
  const player = players.find((item) => item.id === report.playerId);
  const session = matchSessions.find((item) => item.id === report.matchSessionId);
  const reportPoints = useMemo(
    () =>
      pressurePoints.filter(
        (point) =>
          point.playerId === report.playerId &&
          point.matchSessionId === report.matchSessionId,
      ),
    [report],
  );

  return (
    <PageShell
      eyebrow="Coaching output"
      title="Reports"
      description="Review coach-ready summaries built from pressure-point analysis and comparison anchors in the elite library."
    >
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Select report
            </span>
            <select
              value={selectedReportId}
              onChange={(event) => setSelectedReportId(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {reportSummaries.map((item) => {
                const reportPlayer = players.find(
                  (playerItem) => playerItem.id === item.playerId,
                );

                return (
                  <option key={item.id} value={item.id}>
                    {reportPlayer?.name} - {item.createdAt}
                  </option>
                );
              })}
            </select>
          </label>

          <div className="mt-5 space-y-3">
            {reportSummaries.map((item) => {
              const reportPlayer = players.find(
                (playerItem) => playerItem.id === item.playerId,
              );
              const reportSession = matchSessions.find(
                (sessionItem) => sessionItem.id === item.matchSessionId,
              );
              const isSelected = item.id === report.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedReportId(item.id)}
                  className={`w-full rounded-md border p-3 text-left transition ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="block text-sm font-semibold text-slate-950">
                    {reportPlayer?.name}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">
                    {reportSession?.event}
                  </span>
                  <span className="mt-2 block text-xs font-medium text-slate-500">
                    {item.pressurePointsAnalyzed} pressure points
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">
                {report.title}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {player?.name} | {session?.event} | Created {report.createdAt}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-700">
                {report.summary}
              </p>
            </div>
            <div className="w-fit rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              {report.pressurePointsAnalyzed} points analyzed
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Observed pressure tendencies
              </h3>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                {report.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Breakdown patterns
              </h3>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                {report.vulnerabilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Coaching priorities
              </h3>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                {report.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-6 rounded-md bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-950">
              Current elite pressure library comparisons
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Compared with the elite pressure library, the closest patterns are: {report.eliteComparisons.join(" | ")}. These references inform coaching judgment rather than prescribing what an elite player would always do.
              Next-time adjustments should be scaled to the player&apos;s current
              pattern, score context, and available court position.
            </p>
          </div>

          <section className="mt-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Pressure Points Analyzed
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Individual pressure points supporting this coaching report.
                </p>
              </div>
              <p className="text-sm font-medium text-slate-500">
                {reportPoints.length} visible points
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {reportPoints.map((point) => (
                <article
                  key={point.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {point.timestamp} | {point.scoreContext}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {point.trigger} | {point.server} serving to{" "}
                        {point.returner}
                      </p>
                    </div>
                    <span
                      className={`w-fit rounded-md px-2.5 py-1 text-sm font-semibold ${
                        point.outcome === "Won"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {point.outcome}
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <dt className="font-medium text-slate-500">
                        Serve / return
                      </dt>
                      <dd className="mt-1 text-slate-900">
                        {point.server === player?.name
                          ? "Serving pressure point"
                          : "Returning pressure point"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">
                        Rally length
                      </dt>
                      <dd className="mt-1 text-slate-900">
                        {point.rallyLength} shots
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">
                        Score context
                      </dt>
                      <dd className="mt-1 text-slate-900">
                        {point.scoreContext}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">
                        Pressure trigger
                      </dt>
                      <dd className="mt-1 text-slate-900">{point.trigger}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">
                        Server / returner
                      </dt>
                      <dd className="mt-1 text-slate-900">
                        {point.server} / {point.returner}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">
                        Outcome
                      </dt>
                      <dd className="mt-1 text-slate-900">{point.outcome}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">
                        Elite pressure library anchor
                      </dt>
                      <dd className="mt-1 text-slate-900">
                        {point.eliteComparisonAnchor ?? "Not assigned"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">
                        Observed pressure tendency
                      </dt>
                      <dd className="mt-1 leading-6 text-slate-900">
                        {point.patternObserved}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">
                        Coaching priority
                      </dt>
                      <dd className="mt-1 leading-6 text-slate-900">
                        {point.coachNote}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>
        </article>
      </div>
    </PageShell>
  );
}
