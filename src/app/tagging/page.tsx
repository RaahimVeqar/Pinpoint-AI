"use client";

import { FormEvent, useState } from "react";
import { PageShell } from "@/components/page-shell";
import {
  matchSessions,
  players,
  pressurePoints,
  PressurePoint,
  PressureTrigger,
} from "@/lib/mock-data";

type DraftPoint = Omit<PressurePoint, "id">;

const pressureTriggers: PressureTrigger[] = [
  "30-30",
  "Deuce",
  "Advantage",
  "Break Point",
  "Set Point",
  "Match Point",
  "Tiebreak",
];

export default function TaggingPage() {
  const samplePoint = pressurePoints[0];
  const [draftPoint, setDraftPoint] = useState<DraftPoint>({
    matchSessionId: samplePoint.matchSessionId,
    playerId: samplePoint.playerId,
    timestamp: samplePoint.timestamp,
    trigger: samplePoint.trigger,
    scoreContext: samplePoint.scoreContext,
    server: samplePoint.server,
    returner: samplePoint.returner,
    rallyLength: samplePoint.rallyLength,
    patternObserved: samplePoint.patternObserved,
    outcome: samplePoint.outcome,
    coachNote: samplePoint.coachNote,
    eliteComparisonAnchor: samplePoint.eliteComparisonAnchor,
  });
  const [localPoints, setLocalPoints] = useState<PressurePoint[]>([]);

  const session = matchSessions.find(
    (item) => item.id === draftPoint.matchSessionId,
  );
  const player = players.find((item) => item.id === draftPoint.playerId);

  function updateDraft<Field extends keyof DraftPoint>(
    field: Field,
    value: DraftPoint[Field],
  ) {
    setDraftPoint((current) => ({ ...current, [field]: value }));
  }

  function handleSessionChange(matchSessionId: string) {
    const nextSession = matchSessions.find((item) => item.id === matchSessionId);

    if (!nextSession) {
      return;
    }

    const nextPlayer = players.find((item) => item.id === nextSession.playerId);

    setDraftPoint((current) => ({
      ...current,
      matchSessionId,
      playerId: nextSession.playerId,
      server: nextPlayer?.name ?? current.server,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLocalPoints((current) => [
      {
        ...draftPoint,
        id: `local-point-${current.length + 1}`,
      },
      ...current,
    ]);
  }

  return (
    <PageShell
      eyebrow="Manual analysis"
      title="Pressure Point Tagging"
      description="Capture structured high-pressure point details before report generation."
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Session</span>
              <select
                value={draftPoint.matchSessionId}
                onChange={(event) => handleSessionChange(event.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {matchSessions.map((item) => {
                  const sessionPlayer = players.find(
                    (playerItem) => playerItem.id === item.playerId,
                  );

                  return (
                    <option key={item.id} value={item.id}>
                      {sessionPlayer?.name} - {item.event}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Player</span>
              <input
                readOnly
                value={player?.name ?? ""}
                className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Pressure trigger
              </span>
              <select
                value={draftPoint.trigger}
                onChange={(event) =>
                  updateDraft("trigger", event.target.value as PressureTrigger)
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {pressureTriggers.map((trigger) => (
                  <option key={trigger}>{trigger}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Score context
              </span>
              <input
                value={draftPoint.scoreContext}
                onChange={(event) =>
                  updateDraft("scoreContext", event.target.value)
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Timestamp
              </span>
              <input
                value={draftPoint.timestamp}
                onChange={(event) => updateDraft("timestamp", event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Server</span>
              <input
                value={draftPoint.server}
                onChange={(event) => updateDraft("server", event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Returner</span>
              <input
                value={draftPoint.returner}
                onChange={(event) => updateDraft("returner", event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Rally length
              </span>
              <input
                type="number"
                min="1"
                value={draftPoint.rallyLength}
                onChange={(event) =>
                  updateDraft("rallyLength", Number(event.target.value))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Outcome</span>
              <select
                value={draftPoint.outcome}
                onChange={(event) =>
                  updateDraft("outcome", event.target.value as "Won" | "Lost")
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option>Won</option>
                <option>Lost</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Elite anchor
              </span>
              <input
                value={draftPoint.eliteComparisonAnchor ?? ""}
                onChange={(event) =>
                  updateDraft("eliteComparisonAnchor", event.target.value)
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </label>
          </div>
          <label className="mt-4 block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Pattern observed
            </span>
            <textarea
              value={draftPoint.patternObserved}
              onChange={(event) =>
                updateDraft("patternObserved", event.target.value)
              }
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <label className="mt-4 block space-y-2">
            <span className="text-sm font-medium text-slate-700">Coach note</span>
            <textarea
              value={draftPoint.coachNote}
              onChange={(event) => updateDraft("coachNote", event.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <button
            type="submit"
            className="mt-5 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Add pressure point
          </button>
        </form>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Point Preview
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-medium text-slate-500">Session</dt>
                <dd className="mt-1 text-slate-900">{session?.event}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Trigger</dt>
                <dd className="mt-1 text-slate-900">{draftPoint.trigger}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Outcome</dt>
                <dd className="mt-1 text-slate-900">{draftPoint.outcome}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Score context</dt>
                <dd className="mt-1 text-slate-900">
                  {draftPoint.scoreContext}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Rally length</dt>
                <dd className="mt-1 text-slate-900">
                  {draftPoint.rallyLength} shots
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">
                  Pattern observed
                </dt>
                <dd className="mt-1 leading-6 text-slate-900">
                  {draftPoint.patternObserved}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Coach note</dt>
                <dd className="mt-1 leading-6 text-slate-900">
                  {draftPoint.coachNote}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Local points added
            </h2>
            {localPoints.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Added points will appear here for this page session only.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {localPoints.map((point) => (
                  <article
                    key={point.id}
                    className="rounded-md border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="text-sm font-semibold text-slate-950">
                      {point.timestamp} | {point.trigger} | {point.outcome}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {point.scoreContext} - {point.patternObserved}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
