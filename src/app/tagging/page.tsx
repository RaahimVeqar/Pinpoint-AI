import { AnalyzeClipForm } from "@/app/tagging/analyze-clip-form";
import { PageShell } from "@/components/page-shell";
import { listClips } from "@/lib/repositories/clips";
import { listMatchSessions } from "@/lib/repositories/match-sessions";
import { listPlayers } from "@/lib/repositories/players";
import { requireAuthenticatedSupabaseClient } from "@/lib/supabase/authenticated-server";

export const dynamic = "force-dynamic";

export default async function TaggingPage() {
  const { supabase } = await requireAuthenticatedSupabaseClient();
  const [players, matchSessions, clips] = await Promise.all([
    listPlayers(supabase),
    listMatchSessions(supabase),
    listClips(supabase, { uploadStatus: "ready" }),
  ]);
  const playerNames = new Map(
    players.map((player) => [player.id, player.display_name]),
  );
  const sessions = new Map(
    matchSessions.map((session) => [session.id, session]),
  );

  const savedClips = clips.map((clip) => {
    const session = sessions.get(clip.match_session_id);
    return {
      id: clip.id,
      title: clip.title,
      playerName: playerNames.get(clip.player_id) ?? "Owned player",
      sessionTitle: session?.title ?? "Owned match session",
      sessionDetail: session ? formatSessionDetail(session) : "",
      timestampOrRange: clip.timestamp_or_range,
      scoreContext: clip.score_context,
      pressureTrigger: clip.pressure_trigger,
      playerPointOutcome: clip.player_point_outcome,
      coachNote: clip.coach_note,
      analysisStatus: clip.analysis_status,
      reviewStatus: clip.review_status,
      originalFileName: clip.original_file_name,
      createdAt: clip.created_at,
    };
  });

  return (
    <PageShell
      eyebrow="Coach analysis"
      title="Analyze Clip"
      description="Choose footage that is already stored privately, generate the mock AI draft, then refine and save the coaching analysis."
    >
      <AnalyzeClipForm clips={savedClips} />
    </PageShell>
  );
}

function formatSessionDetail(session: {
  event_name: string | null;
  opponent: string | null;
  session_date: string | null;
  surface: string | null;
}): string {
  return [
    session.event_name,
    session.opponent ? `vs ${session.opponent}` : null,
    session.session_date,
    session.surface,
  ]
    .filter(Boolean)
    .join(" · ");
}
