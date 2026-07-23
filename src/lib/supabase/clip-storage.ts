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

export async function validatePrivateClip(
  file: File,
): Promise<AllowedClipMimeType> {
  if (file.size <= 0) {
    throw new ClipStorageError("The uploaded video is empty.", 400);
  }

  if (file.size > MAX_CLIP_FILE_BYTES) {
    throw new ClipStorageError("The uploaded video exceeds 100 MB.", 413);
  }

  if (!isAllowedClipMimeType(file.type)) {
    throw new ClipStorageError("The uploaded file type is not supported.", 415);
  }

  const header = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  if (!hasExpectedVideoSignature(file.type, header)) {
    throw new ClipStorageError(
      "The file contents do not match a supported video format.",
      415,
    );
  }

  return file.type;
}

export function createPrivateClipPath(
  authenticatedUserId: string,
  matchSessionId: string,
  originalFileName: string,
): string {
  const safeName = sanitizeClipFileName(originalFileName);
  return `${authenticatedUserId}/${matchSessionId}/${crypto.randomUUID()}-${safeName}`;
}

export function sanitizeClipFileName(value: string): string {
  const sanitized = value
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return sanitized || "clip";
}

export async function uploadPrivateClip(
  supabase: SupabaseClient,
  storagePath: string,
  file: File,
): Promise<void> {
  const contentType = await validatePrivateClip(file);
  const { error } = await supabase.storage
    .from(PLAYER_CLIPS_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType,
      upsert: false,
    });

  if (error) throw new ClipStorageError("Private clip upload failed.");
}

export async function removePrivateClip(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<void> {
  const { error } = await supabase.storage
    .from(PLAYER_CLIPS_BUCKET)
    .remove([storagePath]);

  if (error) {
    throw new ClipStorageError("Unable to remove an incomplete private clip.");
  }
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

function hasExpectedVideoSignature(
  mimeType: AllowedClipMimeType,
  header: Uint8Array,
): boolean {
  if (mimeType === "video/webm") {
    return (
      header.length >= 4 &&
      header[0] === 0x1a &&
      header[1] === 0x45 &&
      header[2] === 0xdf &&
      header[3] === 0xa3
    );
  }

  return (
    header.length >= 12 &&
    header[4] === 0x66 &&
    header[5] === 0x74 &&
    header[6] === 0x79 &&
    header[7] === 0x70
  );
}
