"use server";

import { revalidatePath } from "next/cache";

import { createMatchSession } from "@/lib/repositories/match-sessions";
import { PlayerClipRepositoryError } from "@/lib/repositories/player-clip-repository";
import { createPlayer, getPlayerById } from "@/lib/repositories/players";
import {
  requireAuthenticatedSupabaseClient,
  SupabaseAuthenticationError,
} from "@/lib/supabase/authenticated-server";

export type CreationActionState = {
  message: string;
  status: "idle" | "error" | "success";
  createdPlayer?: {
    id: string;
    name: string;
  };
  createdSession?: {
    id: string;
    playerId: string;
    title: string;
    detail: string;
  };
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DOMINANT_HANDS = ["left", "right", "ambidextrous"] as const;
const SURFACES = ["Hard", "Clay", "Grass", "Indoor Hard"] as const;

export async function createPlayerAction(
  _previousState: CreationActionState,
  formData: FormData,
): Promise<CreationActionState> {
  try {
    const displayName = requireText(formData, "displayName", 120, "Display name");
    const dominantHand = readEnum(
      formData,
      "dominantHand",
      DOMINANT_HANDS,
      "Dominant hand",
    );
    const notes = readOptionalText(formData, "notes", 5000, "Notes");
    const { supabase } = await requireAuthenticatedSupabaseClient();

    const player = await createPlayer(supabase, {
      display_name: displayName,
      dominant_hand: dominantHand,
      notes,
    });

    revalidatePlayerWorkflow();
    return {
      status: "success",
      message: `${displayName} was added to the active roster.`,
      createdPlayer: {
        id: player.id,
        name: player.display_name,
      },
    };
  } catch (error) {
    return creationError(error, "The player could not be created.");
  }
}

export async function createMatchSessionAction(
  _previousState: CreationActionState,
  formData: FormData,
): Promise<CreationActionState> {
  try {
    const playerId = requireUuid(formData, "playerId", "Player");
    const title = requireText(formData, "title", 200, "Session title");
    const opponent = readOptionalText(formData, "opponent", 200, "Opponent");
    const eventName = readOptionalText(formData, "eventName", 200, "Event");
    const surface = readEnum(formData, "surface", SURFACES, "Surface");
    const sessionDate = readOptionalDate(formData, "sessionDate", "Date");
    const notes = readOptionalText(formData, "notes", 5000, "Notes");
    const { supabase } = await requireAuthenticatedSupabaseClient();
    const player = await getPlayerById(supabase, playerId);

    if (!player) {
      throw new WorkflowInputError("Choose a player you own.");
    }

    const session = await createMatchSession(supabase, {
      player_id: playerId,
      title,
      opponent,
      event_name: eventName,
      surface,
      session_date: sessionDate,
      notes,
    });

    revalidatePlayerWorkflow();
    return {
      status: "success",
      message: `${title} was created for ${player.display_name}.`,
      createdSession: {
        id: session.id,
        playerId: session.player_id,
        title: session.title,
        detail: [
          session.event_name,
          session.opponent ? `vs ${session.opponent}` : null,
          session.session_date,
        ]
          .filter(Boolean)
          .join(" · "),
      },
    };
  } catch (error) {
    return creationError(error, "The match session could not be created.");
  }
}

class WorkflowInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowInputError";
  }
}

function requireText(
  formData: FormData,
  key: string,
  maxLength: number,
  label: string,
): string {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) {
    throw new WorkflowInputError(`${label} is required.`);
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new WorkflowInputError(`${label} is too long.`);
  }
  return trimmed;
}

function requireUuid(formData: FormData, key: string, label: string): string {
  const value = requireText(formData, key, 36, label);
  if (!UUID_PATTERN.test(value)) {
    throw new WorkflowInputError(`${label} is invalid.`);
  }
  return value;
}

function readOptionalText(
  formData: FormData,
  key: string,
  maxLength: number,
  label: string,
): string | null {
  const value = formData.get(key);
  if (value === null || value === "") return null;
  if (typeof value !== "string") {
    throw new WorkflowInputError(`${label} must be text.`);
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new WorkflowInputError(`${label} is too long.`);
  }
  return trimmed || null;
}

function readEnum<const Value extends string>(
  formData: FormData,
  key: string,
  values: readonly Value[],
  label: string,
): Value | null {
  const value = readOptionalText(formData, key, 50, label);
  if (value === null) return null;
  if (!values.includes(value as Value)) {
    throw new WorkflowInputError(`${label} is invalid.`);
  }
  return value as Value;
}

function readOptionalDate(
  formData: FormData,
  key: string,
  label: string,
): string | null {
  const value = readOptionalText(formData, key, 10, label);
  if (value === null) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new WorkflowInputError(`${label} is invalid.`);
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new WorkflowInputError(`${label} is invalid.`);
  }
  return value;
}

function creationError(
  error: unknown,
  fallback: string,
): CreationActionState {
  if (error instanceof WorkflowInputError) {
    return { status: "error", message: error.message };
  }
  if (error instanceof SupabaseAuthenticationError) {
    return { status: "error", message: error.message };
  }
  if (error instanceof PlayerClipRepositoryError) {
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "You do not have access to create this record."
          : fallback,
    };
  }
  return { status: "error", message: fallback };
}

function revalidatePlayerWorkflow() {
  revalidatePath("/players");
  revalidatePath("/matches");
  revalidatePath("/clips/upload");
  revalidatePath("/tagging");
}
