import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  requireRepositoryData,
  throwIfRepositoryFailure,
} from "@/lib/repositories/player-clip-repository";
import { getAuthenticatedUserId } from "@/lib/supabase/authenticated-server";

export type ReportStatus = "draft" | "finalized" | "archived";

export type ReportRow = {
  id: string;
  player_id: string;
  match_session_id: string | null;
  title: string;
  overall_pressure_tendency: string | null;
  dominant_pressure_patterns: string[];
  recurring_breakdowns: string[];
  elite_comparison_summary: string | null;
  coaching_priorities: string[];
  next_session_focus: string | null;
  status: ReportStatus;
  finalized_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ReportClipRow = {
  id: string;
  report_id: string;
  clip_id: string;
  analysis_draft_id: string | null;
  display_order: number;
  status: "included" | "excluded";
  created_by: string;
  created_at: string;
  updated_at: string;
};

type ReportWritableFields = Omit<ReportRow, "id" | "created_at" | "updated_at">;

export type CreateReportInput = Pick<
  ReportWritableFields,
  "player_id" | "title"
> &
  Partial<Omit<ReportWritableFields, "player_id" | "title" | "created_by">>;

export type UpdateReportInput = Partial<
  Omit<ReportWritableFields, "player_id" | "created_by">
>;

export type AttachReportClipInput = Pick<
  ReportClipRow,
  "report_id" | "clip_id"
> &
  Partial<Pick<ReportClipRow, "analysis_draft_id" | "display_order" | "status">>;

const REPORT_COLUMNS =
  "id,player_id,match_session_id,title,overall_pressure_tendency,dominant_pressure_patterns,recurring_breakdowns,elite_comparison_summary,coaching_priorities,next_session_focus,status,finalized_at,created_by,created_at,updated_at";
const REPORT_CLIP_COLUMNS =
  "id,report_id,clip_id,analysis_draft_id,display_order,status,created_by,created_at,updated_at";

export async function listReports(
  supabase: SupabaseClient,
  playerId: string,
): Promise<ReportRow[]> {
  const { data, error } = await supabase
    .from("reports")
    .select(REPORT_COLUMNS)
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  return requireRepositoryData(
    data as unknown as ReportRow[] | null,
    error,
    "Unable to list reports",
  );
}

export async function getReportById(
  supabase: SupabaseClient,
  reportId: string,
): Promise<ReportRow | null> {
  const { data, error } = await supabase
    .from("reports")
    .select(REPORT_COLUMNS)
    .eq("id", reportId)
    .maybeSingle();

  if (error) return requireRepositoryData(null, error, "Unable to get report");
  return data as unknown as ReportRow | null;
}

export async function createReport(
  supabase: SupabaseClient,
  input: CreateReportInput,
): Promise<ReportRow> {
  const authenticatedUserId = await getAuthenticatedUserId(supabase);
  const { data, error } = await supabase
    .from("reports")
    .insert({ ...input, created_by: authenticatedUserId })
    .select(REPORT_COLUMNS)
    .single();

  return requireRepositoryData(
    data as unknown as ReportRow | null,
    error,
    "Unable to create report",
  );
}

export async function updateReport(
  supabase: SupabaseClient,
  reportId: string,
  input: UpdateReportInput,
): Promise<ReportRow> {
  const { data, error } = await supabase
    .from("reports")
    .update(input)
    .eq("id", reportId)
    .select(REPORT_COLUMNS)
    .single();

  return requireRepositoryData(
    data as unknown as ReportRow | null,
    error,
    "Unable to update report",
  );
}

export async function listReportClips(
  supabase: SupabaseClient,
  reportId: string,
): Promise<ReportClipRow[]> {
  const { data, error } = await supabase
    .from("report_clips")
    .select(REPORT_CLIP_COLUMNS)
    .eq("report_id", reportId)
    .eq("status", "included")
    .order("display_order");

  return requireRepositoryData(
    data as unknown as ReportClipRow[] | null,
    error,
    "Unable to list report clips",
  );
}

export async function attachReportClip(
  supabase: SupabaseClient,
  input: AttachReportClipInput,
): Promise<ReportClipRow> {
  const authenticatedUserId = await getAuthenticatedUserId(supabase);
  const { data, error } = await supabase
    .from("report_clips")
    .insert({ ...input, created_by: authenticatedUserId })
    .select(REPORT_CLIP_COLUMNS)
    .single();

  return requireRepositoryData(
    data as unknown as ReportClipRow | null,
    error,
    "Unable to attach report clip",
  );
}

export async function detachReportClip(
  supabase: SupabaseClient,
  reportId: string,
  clipId: string,
): Promise<void> {
  const { error } = await supabase
    .from("report_clips")
    .delete()
    .eq("report_id", reportId)
    .eq("clip_id", clipId);

  throwIfRepositoryFailure(error, "Unable to detach report clip");
}
