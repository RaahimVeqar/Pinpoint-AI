"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import {
  matchSessions,
  players,
  pressurePoints,
  reportSummaries,
} from "@/lib/mock-data";

export default function PlayersPage() {
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0].id);
  const selectedPlayer =
    players.find((player) => player.id === selectedPlayerId) ?? players[0];
  const playerSessions = useMemo(
    () =>
      matchSessions.filter((session) => session.playerId === selectedPlayer.id),
    [selectedPlayer.id],
  );
  const playerPoints = useMemo(
    () => pressurePoints.filter((point) => point.playerId === selectedPlayer.id),
    [selectedPlayer.id],
  );
  const linkedReport = reportSummaries.find(
    (report) => report.playerId === selectedPlayer.id,
  );

  return (
    <PageShell
      eyebrow="Roster"
      title="Players"
      description="Manage developing player profiles, pressure tendencies, and current coaching priorities."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-4 lg:grid-cols-2">
          {players.map((player) => {
            const isSelected = player.id === selectedPlayer.id;

            return (
              <button
                key={player.id}
                type="button"
                onClick={() => setSelectedPlayerId(player.id)}
                className={`rounded-lg border bg-white p-5 text-left shadow-sm transition ${
                  isSelected
                    ? "border-emerald-600 ring-2 ring-emerald-100"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      {player.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {player.level} | {player.age} | {player.handedness}-handed
                    </p>
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
                    {player.pressureWinRate}%
                  </span>
                </div>
                <dl className="mt-5 space-y-3 text-sm">
                  <div>
                    <dt className="font-medium text-slate-500">Style</dt>
                    <dd className="mt-1 text-slate-900">
                      {player.playingStyle}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">
                      Current focus
                    </dt>
                    <dd className="mt-1 leading-6 text-slate-900">
                      {player.primaryFocus}
                    </dd>
                  </div>
                </dl>
              </button>
            );
          })}
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                {selectedPlayer.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {selectedPlayer.level} | Coach: {selectedPlayer.coach}
              </p>
            </div>
            <span className="rounded-md bg-slate-950 px-2.5 py-1 text-sm font-semibold text-white">
              {selectedPlayer.pressureWinRate}% win rate
            </span>
          </div>

          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500">Player profile</dt>
              <dd className="mt-1 leading-6 text-slate-900">
                {selectedPlayer.age}, {selectedPlayer.handedness}-handed{" "}
                {selectedPlayer.playingStyle.toLowerCase()}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Current focus</dt>
              <dd className="mt-1 leading-6 text-slate-900">
                {selectedPlayer.primaryFocus}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Sessions tracked</dt>
              <dd className="mt-1 text-slate-900">{playerSessions.length}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Linked report</dt>
              <dd className="mt-1 text-slate-900">
                {linkedReport ? linkedReport.title : "No report drafted yet"}
              </dd>
            </div>
          </dl>

          <section className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Recent pressure points
            </h3>
            {playerPoints.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                No pressure points tagged for this player yet.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {playerPoints.slice(0, 3).map((point) => {
                  const pointSession = matchSessions.find(
                    (session) => session.id === point.matchSessionId,
                  );

                  return (
                    <article
                      key={point.id}
                      className="rounded-md border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {point.timestamp} | {point.trigger}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {pointSession?.event}
                          </p>
                        </div>
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${
                            point.outcome === "Won"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {point.outcome}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {point.patternObserved}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
