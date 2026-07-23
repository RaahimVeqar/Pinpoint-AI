import Link from "next/link";

import { MatchSessionCreateForm } from "@/app/matches/match-session-create-form";
import { SavedClipPlayback } from "@/app/matches/saved-clip-playback";
import { PageShell } from "@/components/page-shell";
import { listClips } from "@/lib/repositories/clips";
import { listMatchSessions } from "@/lib/repositories/match-sessions";
import { listPlayers } from "@/lib/repositories/players";
import { requireAuthenticatedSupabaseClient } from "@/lib/supabase/authenticated-server";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const { supabase } = await requireAuthenticatedSupabaseClient();
  const [players, matchSessions, clips] = await Promise.all([
    listPlayers(supabase),
    listMatchSessions(supabase),
    listClips(supabase),
  ]);
  const activePlayers = players
    .filter((player) => player.status === "active")
    .map((player) => ({ id: player.id, name: player.display_name }));
  const playerNames = new Map(
    players.map((player) => [player.id, player.display_name]),
  );
  const visibleSessions = matchSessions.filter(
    (session) => session.status !== "archived",
  );
  const readyClips = clips.filter((clip) => clip.upload_status === "ready");
  const sessionsWithClips = new Set(clips.map((clip) => clip.match_session_id));

  return (
    <PageShell
      eyebrow="Private match evidence"
      title="Matches / Saved Clips"
      description="Create the required session context, then keep each owned clip connected to the player and match where it belongs."
    >
      <MatchSessionCreateForm players={activePlayers} />

      <div className="library-summary" aria-label="Saved clip library summary">
        <div><strong className="tabular">{visibleSessions.length}</strong><span>match / training sessions</span></div>
        <div><strong className="tabular">{readyClips.length}</strong><span>private clips ready</span></div>
        <div><strong className="tabular">{sessionsWithClips.size}</strong><span>sessions with evidence</span></div>
        <Link href="/clips/upload" className="button-primary">Upload a private clip <span aria-hidden="true">→</span></Link>
      </div>

      {visibleSessions.length === 0 ? (
        <section className="surface workflow-empty" aria-labelledby="empty-sessions-heading">
          <h2 id="empty-sessions-heading">No match sessions yet</h2>
          <p>Create the first session above. It will immediately become available in the private upload workflow.</p>
        </section>
      ) : (
        <div className="match-library">
          {visibleSessions.map((session) => {
            const sessionClips = clips.filter(
              (clip) => clip.match_session_id === session.id,
            );
            return (
              <article key={session.id} className="surface match-session">
                <header className="match-session__header">
                  <div>
                    <p>{playerNames.get(session.player_id) ?? "Owned player"}</p>
                    <h2>{session.title}</h2>
                    <span>{formatSessionContext(session)}</span>
                  </div>
                  <div className="match-session__readiness">
                    <span className="status status-neutral">{formatStatus(session.status)}</span>
                    <span className={sessionClips.length ? "status status-success" : "status status-warning"}>
                      {sessionClips.length
                        ? `${sessionClips.length} clip${sessionClips.length === 1 ? "" : "s"}`
                        : "Awaiting clips"}
                    </span>
                  </div>
                </header>

                {sessionClips.length === 0 ? (
                  <p className="match-session__empty">No private clips are linked to this session yet.</p>
                ) : (
                  <div className="clip-list">
                    {sessionClips.map((clip) => (
                      <details key={clip.id} className="clip-row">
                        <summary>
                          <div className="clip-row__identity">
                            <span className="clip-row__time tabular">
                              {clip.timestamp_or_range || "Full clip"}
                            </span>
                            <div>
                              <h3>{clip.title}</h3>
                              <p>{clip.score_context || clip.original_file_name}</p>
                            </div>
                          </div>
                          <div className="clip-row__signals">
                            <span>{formatBytes(clip.file_size_bytes)}</span>
                            <span className={clip.upload_status === "ready" ? "status status-success" : "status status-warning"}>
                              {formatStatus(clip.upload_status)}
                            </span>
                            <b aria-hidden="true">+</b>
                          </div>
                        </summary>
                        <div className="detail-body clip-detail">
                          <dl className="clip-detail__context">
                            <div><dt>Player</dt><dd>{playerNames.get(clip.player_id) ?? "Owned player"}</dd></div>
                            <div><dt>Pressure trigger</dt><dd>{clip.pressure_trigger || "Not specified"}</dd></div>
                            <div><dt>Point outcome</dt><dd>{clip.player_point_outcome || "Not specified"}</dd></div>
                            <div><dt>Review state</dt><dd>{formatStatus(clip.review_status)}</dd></div>
                          </dl>
                          <SavedClipPlayback
                            clipId={clip.id}
                            isReady={clip.upload_status === "ready"}
                            title={clip.title}
                          />
                        </div>
                      </details>
                    ))}
                  </div>
                )}

                {session.notes && (
                  <footer className="match-session__report">
                    <div><span>Session notes</span><p>{session.notes}</p></div>
                  </footer>
                )}
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

function formatSessionContext(session: {
  event_name: string | null;
  opponent: string | null;
  session_date: string | null;
  surface: string | null;
}): string {
  return [
    session.event_name,
    session.opponent ? `vs ${session.opponent}` : null,
    formatDate(session.session_date),
    session.surface,
  ]
    .filter(Boolean)
    .join(" · ");
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
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

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
