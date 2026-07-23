"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { MatchSessionCreateForm } from "@/app/matches/match-session-create-form";

type PlayerView = {
  id: string;
  name: string;
  dominantHand: "left" | "right" | "ambidextrous" | null;
  notes: string | null;
  status: string;
  sessionCount: number;
  clipCount: number;
  sessions: Array<{
    id: string;
    title: string;
    date: string | null;
    detail: string;
    status: string;
  }>;
};

type PlayerRosterProps = {
  players: PlayerView[];
};

export function PlayerRoster({ players }: PlayerRosterProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id ?? "");
  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === selectedPlayerId) ?? players[0],
    [players, selectedPlayerId],
  );

  if (!selectedPlayer) {
    return (
      <section className="surface workflow-empty" aria-labelledby="empty-roster-heading">
        <h2 id="empty-roster-heading">Your roster is ready for its first player</h2>
        <p>Add a player above, then create the match session required for clip upload.</p>
      </section>
    );
  }

  return (
    <div className="players-layout">
      <section className="player-roster" aria-labelledby="roster-heading">
        <div className="player-roster__head">
          <h2 id="roster-heading">Active roster</h2>
          <span>{players.length} player{players.length === 1 ? "" : "s"}</span>
        </div>
        <div className="player-roster__list">
          {players.map((player) => {
            const selected = player.id === selectedPlayer.id;
            return (
              <button
                key={player.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedPlayerId(player.id)}
                className={selected ? "is-selected" : ""}
              >
                <div>
                  <strong>{player.name}</strong>
                  <span>{formatHand(player.dominantHand)}</span>
                </div>
                <div>
                  <strong className="tabular">{player.clipCount}</strong>
                  <span>saved clips</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <article className="surface player-profile">
        <header className="player-profile__header">
          <div>
            <p>Player profile</p>
            <h2>{selectedPlayer.name}</h2>
            <span>{formatHand(selectedPlayer.dominantHand)} · Active roster</span>
          </div>
          <div className="player-profile__rate">
            <strong className="tabular">{selectedPlayer.sessionCount}</strong>
            <span>match and training sessions</span>
          </div>
        </header>

        <div className="player-profile__overview">
          <section>
            <span>Roster notes</span>
            <h3>{selectedPlayer.notes || "No private coaching notes added yet."}</h3>
          </section>
          <section>
            <span>Evidence connected</span>
            <h3>
              {selectedPlayer.clipCount} private clip
              {selectedPlayer.clipCount === 1 ? "" : "s"} across{" "}
              {selectedPlayer.sessionCount} session
              {selectedPlayer.sessionCount === 1 ? "" : "s"}.
            </h3>
          </section>
        </div>

        <dl className="player-profile__links">
          <div><dt>Sessions tracked</dt><dd className="tabular">{selectedPlayer.sessionCount}</dd></div>
          <div><dt>Private clips</dt><dd className="tabular">{selectedPlayer.clipCount}</dd></div>
          <div><dt>Record status</dt><dd>{selectedPlayer.status}</dd></div>
        </dl>

        <section className="player-evidence" aria-labelledby="recent-sessions-heading">
          <div className="player-evidence__head">
            <div>
              <h3 id="recent-sessions-heading">Match sessions</h3>
              <p>Coaching contexts available for this player&apos;s private clips.</p>
            </div>
            <Link href="/clips/upload" className="button-secondary">Upload a clip</Link>
          </div>

          {selectedPlayer.sessions.length === 0 ? (
            <div className="player-session-empty">
              <strong>No match sessions yet</strong>
              <p>Create the first match, practice, or review context for this player below.</p>
            </div>
          ) : (
            <div className="player-evidence__list">
              {selectedPlayer.sessions.map((session) => (
                <article key={session.id}>
                  <div>
                    <strong>{session.title}</strong>
                    <span className="tabular">{formatDate(session.date)}</span>
                  </div>
                  <p>{session.detail || "No optional match details added."}</p>
                  <span className="status status-neutral">{formatStatus(session.status)}</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <details className="player-session-create">
          <summary>
            <span>Create a match session</span>
            <span>Add match, practice, or review context</span>
          </summary>
          <MatchSessionCreateForm
            key={selectedPlayer.id}
            embedded
            hideIntro
            playerId={selectedPlayer.id}
            players={[{ id: selectedPlayer.id, name: selectedPlayer.name }]}
          />
        </details>
      </article>
    </div>
  );
}

function formatHand(value: PlayerView["dominantHand"]): string {
  if (value === "ambidextrous") return "Ambidextrous";
  if (value === "left") return "Left-handed";
  if (value === "right") return "Right-handed";
  return "Dominant hand not specified";
}

function formatDate(value: string | null): string {
  if (!value) return "Date not specified";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatStatus(value: string): string {
  return value.replaceAll("_", " ");
}
