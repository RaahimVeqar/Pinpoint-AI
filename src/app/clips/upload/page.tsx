import { ClipUploadForm } from "@/app/clips/upload/clip-upload-form";
import { PageShell } from "@/components/page-shell";
import { listMatchSessions } from "@/lib/repositories/match-sessions";
import { listPlayers } from "@/lib/repositories/players";
import { requireAuthenticatedSupabaseClient } from "@/lib/supabase/authenticated-server";

export const dynamic = "force-dynamic";

export default async function ClipUploadPage() {
  const { supabase } = await requireAuthenticatedSupabaseClient();
  const [players, matchSessions] = await Promise.all([
    listPlayers(supabase, "active"),
    listMatchSessions(supabase),
  ]);

  const playerOptions = players.map((player) => ({
    id: player.id,
    name: player.display_name,
  }));
  const sessionOptions = matchSessions
    .filter((session) => session.status !== "archived")
    .map((session) => ({
      id: session.id,
      playerId: session.player_id,
      title: session.title,
      detail: formatSessionDetail(session),
    }));

  return (
    <PageShell
      eyebrow="Private player footage"
      title="Upload a clip"
      description="Store the original video in private Supabase Storage, connect it to the right player and session, then verify access with a short-lived preview link."
    >
      <ClipUploadForm players={playerOptions} sessions={sessionOptions} />
    </PageShell>
  );
}

function formatSessionDetail(session: {
  event_name: string | null;
  opponent: string | null;
  session_date: string | null;
}): string {
  return [
    session.event_name,
    session.opponent ? `vs ${session.opponent}` : null,
    session.session_date,
  ]
    .filter(Boolean)
    .join(" · ");
}
