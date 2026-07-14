"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { matchSessions, players, pressurePoints, reportSummaries } from "@/lib/mock-data";

export default function PlayersPage() {
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0].id);
  const selectedPlayer = players.find((player) => player.id === selectedPlayerId) ?? players[0];
  const playerSessions = useMemo(() => matchSessions.filter((session) => session.playerId === selectedPlayer.id), [selectedPlayer.id]);
  const playerPoints = useMemo(() => pressurePoints.filter((point) => point.playerId === selectedPlayer.id), [selectedPlayer.id]);
  const linkedReport = reportSummaries.find((report) => report.playerId === selectedPlayer.id);

  return (
    <PageShell
      eyebrow="Player development"
      title="Players"
      description="Move from the roster to a clear picture of each player's current pressure tendency, recent evidence, and coaching focus."
    >
      <div className="players-layout">
        <section className="player-roster" aria-labelledby="roster-heading">
          <div className="player-roster__head"><h2 id="roster-heading">Active roster</h2><span>{players.length} players</span></div>
          <div className="player-roster__list">
            {players.map((player) => {
              const selected = player.id === selectedPlayer.id;
              return (
                <button key={player.id} type="button" aria-pressed={selected} onClick={() => setSelectedPlayerId(player.id)} className={selected ? "is-selected" : ""}>
                  <div><strong>{player.name}</strong><span>{player.level} · {player.handedness}-handed</span></div>
                  <div><strong className="tabular">{player.pressureWinRate}%</strong><span>pressure points</span></div>
                </button>
              );
            })}
          </div>
        </section>

        <article className="surface player-profile">
          <header className="player-profile__header">
            <div><p>Player profile</p><h2>{selectedPlayer.name}</h2><span>{selectedPlayer.level} · Coach {selectedPlayer.coach}</span></div>
            <div className="player-profile__rate"><strong className="tabular">{selectedPlayer.pressureWinRate}%</strong><span>observed pressure win rate</span></div>
          </header>

          <div className="player-profile__overview">
            <section><span>Playing identity</span><h3>{selectedPlayer.playingStyle}</h3><p>{selectedPlayer.age}, {selectedPlayer.handedness}-handed player</p></section>
            <section><span>Current coaching focus</span><h3>{selectedPlayer.primaryFocus}</h3></section>
          </div>

          <dl className="player-profile__links">
            <div><dt>Sessions tracked</dt><dd className="tabular">{playerSessions.length}</dd></div>
            <div><dt>Pressure points tagged</dt><dd className="tabular">{playerPoints.length}</dd></div>
            <div><dt>Linked report</dt><dd>{linkedReport ? linkedReport.title : "No report drafted yet"}</dd></div>
          </dl>

          <section className="player-evidence" aria-labelledby="recent-points-heading">
            <div className="player-evidence__head"><div><h3 id="recent-points-heading">Recent pressure points</h3><p>The latest evidence informing this player&apos;s coaching focus.</p></div>{linkedReport && <Link href="/reports" className="button-secondary">Open report</Link>}</div>
            {playerPoints.length === 0 ? (
              <p className="notice">No pressure points have been tagged for this player yet.</p>
            ) : (
              <div className="player-evidence__list">
                {playerPoints.slice(0, 3).map((point) => {
                  const pointSession = matchSessions.find((session) => session.id === point.matchSessionId);
                  return (
                    <article key={point.id}>
                      <div><strong className="tabular">{point.timestamp}</strong><span>{point.trigger} · {pointSession?.event}</span></div>
                      <p>{point.patternObserved}</p>
                      <span className={`status ${point.outcome === "Won" ? "status-success" : "status-danger"}`}>{point.outcome}</span>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </article>
      </div>
    </PageShell>
  );
}
