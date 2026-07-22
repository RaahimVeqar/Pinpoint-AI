import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { requireRepositoryData } from "@/lib/repositories/player-clip-repository";
import { getAuthenticatedUserId } from "@/lib/supabase/authenticated-server";

export type AnalysisDraftStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "rejected";

export type AnalysisDraftRow = {
  id: string;
  clip_id: string;
  serve_or_return: "Serve" | "Return" | "Unknown" | null;
  point_outcome: string | null;
  first_serve_in: boolean | null;
  rally_length_estimate: number | null;
  primary_pattern: string | null;
  pressure_pattern_family: string | null;
  likely_breakdown_moment: string | null;
  decision_quality: string | null;
  execution_quality: string | null;
  missed_opportunity: string | null;
  elite_reference_pattern: string | null;
  aggression_level: "Controlled" | "Balanced" | "High" | null;
  risk_decision: "Conservative" | "Calculated" | "Aggressive" | null;
  shot_that_decided_point: string | null;
  error_or_winner_type: string | null;
  reset_behavior: string | null;
  body_language_note: string | null;
  tactical_principle: string | null;
  coaching_takeaway: string | null;
  tags: string[];
  confidence_level: "Low" | "Medium" | "High" | null;
  elite_comparison: string | null;
  next_time_adjustment: string | null;
  training_focus: string | null;
  analysis_notes: string | null;
  status: AnalysisDraftStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type AnalysisDraftWritableFields = Omit<
  AnalysisDraftRow,
  "id" | "created_at" | "updated_at"
>;

export type UpsertAnalysisDraftInput = Pick<
  AnalysisDraftWritableFields,
  "clip_id"
> &
  Partial<
    Omit<AnalysisDraftWritableFields, "clip_id" | "created_by">
  >;

export type UpdateAnalysisDraftInput = Partial<
  Omit<AnalysisDraftWritableFields, "clip_id" | "created_by">
>;

const ANALYSIS_DRAFT_COLUMNS =
  "id,clip_id,serve_or_return,point_outcome,first_serve_in,rally_length_estimate,primary_pattern,pressure_pattern_family,likely_breakdown_moment,decision_quality,execution_quality,missed_opportunity,elite_reference_pattern,aggression_level,risk_decision,shot_that_decided_point,error_or_winner_type,reset_behavior,body_language_note,tactical_principle,coaching_takeaway,tags,confidence_level,elite_comparison,next_time_adjustment,training_focus,analysis_notes,status,created_by,created_at,updated_at";

export async function listAnalysisDrafts(
  supabase: SupabaseClient,
  clipId: string,
): Promise<AnalysisDraftRow[]> {
  const { data, error } = await supabase
    .from("analysis_drafts")
    .select(ANALYSIS_DRAFT_COLUMNS)
    .eq("clip_id", clipId)
    .order("created_at", { ascending: false });

  return requireRepositoryData(
    data as unknown as AnalysisDraftRow[] | null,
    error,
    "Unable to list analysis drafts",
  );
}

export async function getAnalysisDraftById(
  supabase: SupabaseClient,
  analysisDraftId: string,
): Promise<AnalysisDraftRow | null> {
  const { data, error } = await supabase
    .from("analysis_drafts")
    .select(ANALYSIS_DRAFT_COLUMNS)
    .eq("id", analysisDraftId)
    .maybeSingle();

  if (error) {
    return requireRepositoryData(null, error, "Unable to get analysis draft");
  }

  return data as unknown as AnalysisDraftRow | null;
}

export async function upsertAnalysisDraft(
  supabase: SupabaseClient,
  input: UpsertAnalysisDraftInput,
): Promise<AnalysisDraftRow> {
  const authenticatedUserId = await getAuthenticatedUserId(supabase);
  const { data, error } = await supabase
    .from("analysis_drafts")
    .upsert(
      { ...input, created_by: authenticatedUserId },
      { onConflict: "clip_id" },
    )
    .select(ANALYSIS_DRAFT_COLUMNS)
    .single();

  return requireRepositoryData(
    data as unknown as AnalysisDraftRow | null,
    error,
    "Unable to save analysis draft",
  );
}

export async function updateAnalysisDraft(
  supabase: SupabaseClient,
  analysisDraftId: string,
  input: UpdateAnalysisDraftInput,
): Promise<AnalysisDraftRow> {
  const { data, error } = await supabase
    .from("analysis_drafts")
    .update(input)
    .eq("id", analysisDraftId)
    .select(ANALYSIS_DRAFT_COLUMNS)
    .single();

  return requireRepositoryData(
    data as unknown as AnalysisDraftRow | null,
    error,
    "Unable to update analysis draft",
  );
}
