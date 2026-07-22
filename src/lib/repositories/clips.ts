import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { requireRepositoryData } from "@/lib/repositories/player-clip-repository";
import { getAuthenticatedUserId } from "@/lib/supabase/authenticated-server";

export type ClipUploadStatus = "pending" | "uploading" | "ready" | "failed";
export type ClipAnalysisStatus =
  | "not_started"
  | "processing"
  | "draft_ready"
  | "reviewed"
  | "failed";
export type ClipReviewStatus =
  | "unreviewed"
  | "in_review"
  | "reviewed"
  | "rejected";

export type ClipRow = {
  id: string;
  player_id: string;
  match_session_id: string;
  title: string;
  storage_bucket: "player-clips";
  storage_path: string;
  original_file_name: string;
  mime_type: "video/mp4" | "video/quicktime" | "video/webm";
  file_size_bytes: number;
  timestamp_or_range: string | null;
  score_context: string | null;
  pressure_trigger: string | null;
  player_point_outcome: "Won" | "Lost" | "Unknown" | null;
  coach_note: string | null;
  upload_status: ClipUploadStatus;
  analysis_status: ClipAnalysisStatus;
  review_status: ClipReviewStatus;
  upload_error: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CreateClipInput = Pick<
  ClipRow,
  | "player_id"
  | "match_session_id"
  | "title"
  | "storage_path"
  | "original_file_name"
  | "mime_type"
  | "file_size_bytes"
> &
  Partial<
    Pick<
      ClipRow,
      | "storage_bucket"
      | "timestamp_or_range"
      | "score_context"
      | "pressure_trigger"
      | "player_point_outcome"
      | "coach_note"
      | "upload_status"
      | "analysis_status"
      | "review_status"
      | "upload_error"
    >
  >;

export type UpdateClipInput = Partial<
  Pick<
    ClipRow,
    | "title"
    | "timestamp_or_range"
    | "score_context"
    | "pressure_trigger"
    | "player_point_outcome"
    | "coach_note"
    | "upload_status"
    | "analysis_status"
    | "review_status"
    | "upload_error"
  >
>;

export type ClipListFilters = {
  matchSessionId?: string;
  playerId?: string;
  reviewStatus?: ClipReviewStatus;
  uploadStatus?: ClipUploadStatus;
  analysisStatus?: ClipAnalysisStatus;
};

const CLIP_COLUMNS =
  "id,player_id,match_session_id,title,storage_bucket,storage_path,original_file_name,mime_type,file_size_bytes,timestamp_or_range,score_context,pressure_trigger,player_point_outcome,coach_note,upload_status,analysis_status,review_status,upload_error,created_by,created_at,updated_at";

export async function listClips(
  supabase: SupabaseClient,
  filters: ClipListFilters = {},
): Promise<ClipRow[]> {
  let query = supabase
    .from("clips")
    .select(CLIP_COLUMNS)
    .order("created_at", { ascending: false });

  if (filters.playerId) query = query.eq("player_id", filters.playerId);
  if (filters.matchSessionId) {
    query = query.eq("match_session_id", filters.matchSessionId);
  }
  if (filters.uploadStatus) {
    query = query.eq("upload_status", filters.uploadStatus);
  }
  if (filters.analysisStatus) {
    query = query.eq("analysis_status", filters.analysisStatus);
  }
  if (filters.reviewStatus) {
    query = query.eq("review_status", filters.reviewStatus);
  }

  const { data, error } = await query;
  return requireRepositoryData(
    data as unknown as ClipRow[] | null,
    error,
    "Unable to list clips",
  );
}

export async function getClipById(
  supabase: SupabaseClient,
  clipId: string,
): Promise<ClipRow | null> {
  const { data, error } = await supabase
    .from("clips")
    .select(CLIP_COLUMNS)
    .eq("id", clipId)
    .maybeSingle();

  if (error) return requireRepositoryData(null, error, "Unable to get clip");
  return data as unknown as ClipRow | null;
}

export async function createClip(
  supabase: SupabaseClient,
  input: CreateClipInput,
): Promise<ClipRow> {
  const authenticatedUserId = await getAuthenticatedUserId(supabase);
  const { data, error } = await supabase
    .from("clips")
    .insert({ ...input, created_by: authenticatedUserId })
    .select(CLIP_COLUMNS)
    .single();

  return requireRepositoryData(
    data as unknown as ClipRow | null,
    error,
    "Unable to create clip",
  );
}

export async function updateClip(
  supabase: SupabaseClient,
  clipId: string,
  input: UpdateClipInput,
): Promise<ClipRow> {
  const { data, error } = await supabase
    .from("clips")
    .update(input)
    .eq("id", clipId)
    .select(CLIP_COLUMNS)
    .single();

  return requireRepositoryData(
    data as unknown as ClipRow | null,
    error,
    "Unable to update clip",
  );
}
