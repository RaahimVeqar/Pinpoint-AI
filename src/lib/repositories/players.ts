import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { requireRepositoryData } from "@/lib/repositories/player-clip-repository";
import { getAuthenticatedUserId } from "@/lib/supabase/authenticated-server";

export type PlayerStatus = "active" | "inactive" | "archived";

export type PlayerRow = {
  id: string;
  display_name: string;
  dominant_hand: "left" | "right" | "ambidextrous" | null;
  notes: string | null;
  status: PlayerStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CreatePlayerInput = Pick<PlayerRow, "display_name"> &
  Partial<Pick<PlayerRow, "dominant_hand" | "notes" | "status">>;

export type UpdatePlayerInput = Partial<
  Pick<PlayerRow, "display_name" | "dominant_hand" | "notes" | "status">
>;

const PLAYER_COLUMNS =
  "id,display_name,dominant_hand,notes,status,created_by,created_at,updated_at";

export async function listPlayers(
  supabase: SupabaseClient,
  status?: PlayerStatus,
): Promise<PlayerRow[]> {
  let query = supabase
    .from("players")
    .select(PLAYER_COLUMNS)
    .order("display_name");

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  return requireRepositoryData(
    data as unknown as PlayerRow[] | null,
    error,
    "Unable to list players",
  );
}

export async function getPlayerById(
  supabase: SupabaseClient,
  playerId: string,
): Promise<PlayerRow | null> {
  const { data, error } = await supabase
    .from("players")
    .select(PLAYER_COLUMNS)
    .eq("id", playerId)
    .maybeSingle();

  if (error) {
    return requireRepositoryData(null, error, "Unable to get player");
  }

  return data as unknown as PlayerRow | null;
}

export async function createPlayer(
  supabase: SupabaseClient,
  input: CreatePlayerInput,
): Promise<PlayerRow> {
  const authenticatedUserId = await getAuthenticatedUserId(supabase);
  const { data, error } = await supabase
    .from("players")
    .insert({ ...input, created_by: authenticatedUserId })
    .select(PLAYER_COLUMNS)
    .single();

  return requireRepositoryData(
    data as unknown as PlayerRow | null,
    error,
    "Unable to create player",
  );
}

export async function updatePlayer(
  supabase: SupabaseClient,
  playerId: string,
  input: UpdatePlayerInput,
): Promise<PlayerRow> {
  const { data, error } = await supabase
    .from("players")
    .update(input)
    .eq("id", playerId)
    .select(PLAYER_COLUMNS)
    .single();

  return requireRepositoryData(
    data as unknown as PlayerRow | null,
    error,
    "Unable to update player",
  );
}
