import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export const PLAYER_CLIPS_BUCKET = "player-clips";
export const MAX_CLIP_FILE_BYTES = 100 * 1024 * 1024;
export const SIGNED_PLAYBACK_SECONDS = 5 * 60;
export const ALLOWED_CLIP_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
] as const;

export type AllowedClipMimeType = (typeof ALLOWED_CLIP_MIME_TYPES)[number];

export class ClipStorageError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ClipStorageError";
    this.status = status;
  }
}

export function validatePrivateClip(file: File): AllowedClipMimeType {
  if (file.size <= 0) {
    throw new ClipStorageError("The uploaded video is empty.", 400);
  }

  if (file.size > MAX_CLIP_FILE_BYTES) {
    throw new ClipStorageError("The uploaded video exceeds 100 MB.", 413);
  }

  if (!isAllowedClipMimeType(file.type)) {
    throw new ClipStorageError("The uploaded file type is not supported.", 415);
  }

  return file.type;
}

export function createPrivateClipPath(
  authenticatedUserId: string,
  originalFileName: string,
): string {
  const safeName = sanitizeFileName(originalFileName);
  return `${authenticatedUserId}/${crypto.randomUUID()}-${safeName}`;
}

export async function uploadPrivateClip(
  supabase: SupabaseClient,
  storagePath: string,
  file: File,
): Promise<void> {
  const { error } = await supabase.storage
    .from(PLAYER_CLIPS_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: validatePrivateClip(file),
      upsert: false,
    });

  if (error) throw new ClipStorageError("Private clip upload failed.");
}

export async function createSignedClipPlaybackUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresInSeconds = SIGNED_PLAYBACK_SECONDS,
): Promise<{ expiresIn: number; signedUrl: string }> {
  if (
    !Number.isInteger(expiresInSeconds) ||
    expiresInSeconds < 60 ||
    expiresInSeconds > 3600
  ) {
    throw new ClipStorageError(
      "Signed playback duration must be between 60 and 3600 seconds.",
      400,
    );
  }

  const { data, error } = await supabase.storage
    .from(PLAYER_CLIPS_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new ClipStorageError("Unable to create a signed playback URL.");
  }

  return { expiresIn: expiresInSeconds, signedUrl: data.signedUrl };
}

function isAllowedClipMimeType(value: string): value is AllowedClipMimeType {
  return (ALLOWED_CLIP_MIME_TYPES as readonly string[]).includes(value);
}

function sanitizeFileName(value: string): string {
  const sanitized = value
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return sanitized || "clip";
}
