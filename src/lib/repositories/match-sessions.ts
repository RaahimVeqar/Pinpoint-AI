import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { requireRepositoryData } from "@/lib/repositories/player-clip-repository";
import { getAuthenticatedUserId } from "@/lib/supabase/authenticated-server";

export type MatchSessionStatus =
  | "draft"
  | "in_progress"
  | "completed"
  | "archived";

export type MatchSessionRow = {
  id: string;
  player_id: string;
  title: string;
  opponent: string | null;
  event_name: string | null;
  surface: "Hard" | "Clay" | "Grass" | "Indoor Hard" | null;
  session_date: string | null;
  notes: string | null;
  status: MatchSessionStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CreateMatchSessionInput = Pick<
  MatchSessionRow,
  "player_id" | "title"
> &
  Partial<
    Pick<
      MatchSessionRow,
      | "opponent"
      | "event_name"
      | "surface"
      | "session_date"
      | "notes"
      | "status"
    >
  >;

export type UpdateMatchSessionInput = Partial<
  Pick<
    MatchSessionRow,
    | "title"
    | "opponent"
    | "event_name"
    | "surface"
    | "session_date"
    | "notes"
    | "status"
  >
>;

const MATCH_SESSION_COLUMNS =
  "id,player_id,title,opponent,event_name,surface,session_date,notes,status,created_by,created_at,updated_at";

export async function listMatchSessions(
  supabase: SupabaseClient,
  playerId: string,
): Promise<MatchSessionRow[]> {
  const { data, error } = await supabase
    .from("match_sessions")
    .select(MATCH_SESSION_COLUMNS)
    .eq("player_id", playerId)
    .order("session_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  return requireRepositoryData(
    data as unknown as MatchSessionRow[] | null,
    error,
    "Unable to list match sessions",
  );
}

export async function getMatchSessionById(
  supabase: SupabaseClient,
  matchSessionId: string,
): Promise<MatchSessionRow | null> {
  const { data, error } = await supabase
    .from("match_sessions")
    .select(MATCH_SESSION_COLUMNS)
    .eq("id", matchSessionId)
    .maybeSingle();

  if (error) {
    return requireRepositoryData(null, error, "Unable to get match session");
  }

  return data as unknown as MatchSessionRow | null;
}

export async function createMatchSession(
  supabase: SupabaseClient,
  input: CreateMatchSessionInput,
): Promise<MatchSessionRow> {
  const authenticatedUserId = await getAuthenticatedUserId(supabase);
  const { data, error } = await supabase
    .from("match_sessions")
    .insert({ ...input, created_by: authenticatedUserId })
    .select(MATCH_SESSION_COLUMNS)
    .single();

  return requireRepositoryData(
    data as unknown as MatchSessionRow | null,
    error,
    "Unable to create match session",
  );
}

export async function updateMatchSession(
  supabase: SupabaseClient,
  matchSessionId: string,
  input: UpdateMatchSessionInput,
): Promise<MatchSessionRow> {
  const { data, error } = await supabase
    .from("match_sessions")
    .update(input)
    .eq("id", matchSessionId)
    .select(MATCH_SESSION_COLUMNS)
    .single();

  return requireRepositoryData(
    data as unknown as MatchSessionRow | null,
    error,
    "Unable to update match session",
  );
}
