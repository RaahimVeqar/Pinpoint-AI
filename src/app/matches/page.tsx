import { PageShell } from "@/components/page-shell";
import { matchSessions, players } from "@/lib/mock-data";

export default function MatchesPage() {
  return (
    <PageShell
      eyebrow="Match footage"
      title="Matches / Sessions"
      description="Review match-session context, tagging status, and pressure-point coverage."
    >
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Session</th>
              <th className="px-4 py-3">Surface</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Tagged</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matchSessions.map((session) => {
              const player = players.find((item) => item.id === session.playerId);

              return (
                <tr key={session.id}>
                  <td className="px-4 py-4 font-medium text-slate-950">
                    {player?.name}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div className="font-medium text-slate-900">
                      {session.event}
                    </div>
                    <div className="mt-1 text-slate-500">
                      vs {session.opponent} • {session.date}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{session.surface}</td>
                  <td className="px-4 py-4 text-slate-700">{session.score}</td>
                  <td className="px-4 py-4 text-slate-700">
                    {session.pressurePointsTagged}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                      {session.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
