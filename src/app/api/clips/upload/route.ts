import { NextResponse } from "next/server";

import { createClip, updateClip } from "@/lib/repositories/clips";
import { getMatchSessionById } from "@/lib/repositories/match-sessions";
import { PlayerClipRepositoryError } from "@/lib/repositories/player-clip-repository";
import {
  requireAuthenticatedSupabaseClient,
  SupabaseAuthenticationError,
} from "@/lib/supabase/authenticated-server";
import {
  ClipStorageError,
  createPrivateClipPath,
  uploadPrivateClip,
  validatePrivateClip,
} from "@/lib/supabase/clip-storage";

export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRESSURE_TRIGGERS = [
  "30-30",
  "Deuce",
  "Advantage",
  "Break Point",
  "Set Point",
  "Match Point",
  "Tiebreak",
] as const;

type PressureTrigger = (typeof PRESSURE_TRIGGERS)[number];

export async function POST(request: Request) {
  try {
    const { supabase, user } =
      await requireAuthenticatedSupabaseClient();
    const formData = await readFormData(request);
    const file = requireFile(formData, "file");
    const mimeType = validatePrivateClip(file);
    const playerId = requireUuid(formData, "playerId");
    const matchSessionId = requireUuid(formData, "matchSessionId");
    const title = requireText(formData, "title", 200);
    const matchSession = await getMatchSessionById(supabase, matchSessionId);

    if (!matchSession) {
      return NextResponse.json(
        { error: "Match session not found." },
        { status: 404 },
      );
    }

    if (matchSession.player_id !== playerId) {
      return NextResponse.json(
        { error: "The match session does not belong to that player." },
        { status: 400 },
      );
    }

    const storagePath = createPrivateClipPath(user.id, file.name);
    const clip = await createClip(supabase, {
      player_id: playerId,
      match_session_id: matchSessionId,
      title,
      storage_bucket: "player-clips",
      storage_path: storagePath,
      original_file_name: file.name,
      mime_type: mimeType,
      file_size_bytes: file.size,
      timestamp_or_range: readOptionalText(formData, "timestampOrRange", 100),
      score_context: readOptionalText(formData, "scoreContext", 200),
      pressure_trigger: readPressureTrigger(formData),
      player_point_outcome: readPlayerPointOutcome(formData),
      coach_note: readOptionalText(formData, "coachNote", 5000),
      upload_status: "pending",
    });

    try {
      await updateClip(supabase, clip.id, { upload_status: "uploading" });
      await uploadPrivateClip(supabase, storagePath, file);
      const readyClip = await updateClip(supabase, clip.id, {
        upload_error: null,
        upload_status: "ready",
      });

      return NextResponse.json({ clip: readyClip }, { status: 201 });
    } catch (error) {
      try {
        await markUploadFailed(supabase, clip.id);
      } catch (statusError) {
        throw new AggregateError(
          [error, statusError],
          "Clip upload failed and its failure status could not be saved.",
        );
      }
      throw error;
    }
  } catch (error) {
    return uploadErrorResponse(error);
  }
}

async function readFormData(request: Request): Promise<FormData> {
  try {
    return await request.formData();
  } catch {
    throw new ClipStorageError("Expected multipart form data.", 400);
  }
}

function requireFile(formData: FormData, key: string): File {
  const value = formData.get(key);
  if (!(value instanceof File)) {
    throw new ClipStorageError(`Missing ${key} file.`, 400);
  }
  return value;
}

function requireUuid(formData: FormData, key: string): string {
  const value = requireText(formData, key, 36);
  if (!UUID_PATTERN.test(value)) {
    throw new ClipStorageError(`${key} must be a UUID.`, 400);
  }
  return value;
}

function requireText(formData: FormData, key: string, maxLength: number): string {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) {
    throw new ClipStorageError(`${key} is required.`, 400);
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new ClipStorageError(`${key} is too long.`, 400);
  }
  return trimmed;
}

function readOptionalText(
  formData: FormData,
  key: string,
  maxLength: number,
): string | null {
  const value = formData.get(key);
  if (value === null || value === "") return null;
  if (typeof value !== "string") {
    throw new ClipStorageError(`${key} must be text.`, 400);
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new ClipStorageError(`${key} is too long.`, 400);
  }
  return trimmed || null;
}

function readPlayerPointOutcome(
  formData: FormData,
): "Won" | "Lost" | "Unknown" | null {
  const value = readOptionalText(formData, "playerPointOutcome", 7);
  if (value === null) return null;
  if (value !== "Won" && value !== "Lost" && value !== "Unknown") {
    throw new ClipStorageError("playerPointOutcome is invalid.", 400);
  }
  return value;
}

function readPressureTrigger(formData: FormData): PressureTrigger | null {
  const value = readOptionalText(formData, "pressureTrigger", 50);
  if (value === null) return null;
  if (!(PRESSURE_TRIGGERS as readonly string[]).includes(value)) {
    throw new ClipStorageError("pressureTrigger is invalid.", 400);
  }
  return value as PressureTrigger;
}

async function markUploadFailed(
  supabase: Parameters<typeof updateClip>[0],
  clipId: string,
): Promise<void> {
  await updateClip(supabase, clipId, {
    upload_error: "Private Storage upload did not complete.",
    upload_status: "failed",
  });
}

function uploadErrorResponse(error: unknown) {
  if (error instanceof SupabaseAuthenticationError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ClipStorageError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof PlayerClipRepositoryError) {
    const status = error.code === "42501" ? 403 : 500;
    return NextResponse.json(
      { error: status === 403 ? "Access denied by RLS." : "Clip upload failed." },
      { status },
    );
  }

  return NextResponse.json({ error: "Clip upload failed." }, { status: 500 });
}
