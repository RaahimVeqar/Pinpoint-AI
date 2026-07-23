import { PlayerCreateForm } from "@/app/players/player-create-form";
import { PlayerRoster } from "@/app/players/player-roster";
import { PageShell } from "@/components/page-shell";
import { listClips } from "@/lib/repositories/clips";
import { listMatchSessions } from "@/lib/repositories/match-sessions";
import { listPlayers } from "@/lib/repositories/players";
import { requireAuthenticatedSupabaseClient } from "@/lib/supabase/authenticated-server";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const { supabase } = await requireAuthenticatedSupabaseClient();
  const [players, sessions, clips] = await Promise.all([
    listPlayers(supabase, "active"),
    listMatchSessions(supabase),
    listClips(supabase),
  ]);

  const roster = players.map((player) => {
    const playerSessions = sessions.filter(
      (session) => session.player_id === player.id,
    );
    const playerClips = clips.filter((clip) => clip.player_id === player.id);

    return {
      id: player.id,
      name: player.display_name,
      dominantHand: player.dominant_hand,
      notes: player.notes,
      status: player.status,
      sessionCount: playerSessions.length,
      clipCount: playerClips.length,
      sessions: playerSessions.map((session) => ({
        id: session.id,
        title: session.title,
        date: session.session_date,
        detail: [
          session.event_name,
          session.opponent ? `vs ${session.opponent}` : null,
          session.surface,
        ]
          .filter(Boolean)
          .join(" · "),
        status: session.status,
      })),
    };
  });

  return (
    <PageShell
      eyebrow="Player development"
      title="Players"
      description="Manage the private roster that connects every match session, uploaded clip, and future coaching review."
    >
      <details className="surface roster-create">
        <summary>
          <span>
            <strong>Add a player</strong>
            <small>Create a private player profile for future sessions and clips.</small>
          </span>
          <span className="button-secondary">Add player</span>
        </summary>
        <PlayerCreateForm embedded hideIntro />
      </details>
      <PlayerRoster players={roster} />
    </PageShell>
  );
}
