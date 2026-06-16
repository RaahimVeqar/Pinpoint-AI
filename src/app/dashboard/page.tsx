import { PageShell } from "@/components/page-shell";
import {
  matchSessions,
  players,
  pressurePoints,
  reportSummaries,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const totalTaggedPoints = matchSessions.reduce(
    (sum, session) => sum + session.pressurePointsTagged,
    0,
  );
  const averagePressureWinRate = Math.round(
    players.reduce((sum, player) => sum + player.pressureWinRate, 0) /
      players.length,
  );
  const recentSession = matchSessions[0];
  const latestReport = reportSummaries[0];

  return (
    <PageShell
      eyebrow="Coach workspace"
      title="Dashboard"
      description="A simple operating view of roster activity, tagged pressure points, and report readiness."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Players tracked", value: players.length },
          { label: "Match sessions", value: matchSessions.length },
          { label: "Tagged pressure points", value: totalTaggedPoints },
          { label: "Avg. pressure win rate", value: `${averagePressureWinRate}%` },
        ].map((metric) => (
          <article
            key={metric.label}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {metric.value}
            </p>
          </article>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Recent session
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-900">
            {recentSession.event}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            vs {recentSession.opponent} on {recentSession.surface}.{" "}
            {recentSession.pressurePointsTagged} pressure points tagged.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Latest pressure tag
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-900">
            {pressurePoints[0].trigger} • {pressurePoints[0].outcome}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {pressurePoints[0].patternObserved}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Report preview
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-900">
            {latestReport.title}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {latestReport.pressurePointsAnalyzed} points compared against{" "}
            {latestReport.eliteComparisons.length} elite anchors.
          </p>
        </article>
      </div>
    </PageShell>
  );
}
