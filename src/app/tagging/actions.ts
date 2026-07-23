"use server";

import { revalidatePath } from "next/cache";

import { upsertAnalysisDraft } from "@/lib/repositories/analysis-drafts";
import { getClipById, updateClip } from "@/lib/repositories/clips";
import { PlayerClipRepositoryError } from "@/lib/repositories/player-clip-repository";
import {
  requireAuthenticatedSupabaseClient,
  SupabaseAuthenticationError,
} from "@/lib/supabase/authenticated-server";

export type AnalysisSaveState = {
  message: string;
  savedClipId?: string;
  savedDraftId?: string;
  status: "idle" | "error" | "success";
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DRAFT_STATUSES = ["draft", "in_review", "approved"] as const;

export async function saveAnalysisDraftAction(
  _previousState: AnalysisSaveState,
  formData: FormData,
): Promise<AnalysisSaveState> {
  let clipId: string | undefined;
  try {
    clipId = requireUuid(formData, "clipId", "Clip");
    const status = readEnum(formData, "reviewStatus", DRAFT_STATUSES, "Review status");
    const { supabase } = await requireAuthenticatedSupabaseClient();
    const clip = await getClipById(supabase, clipId);

    if (!clip || clip.upload_status !== "ready") {
      throw new AnalysisInputError("Choose a saved clip that is ready for analysis.");
    }

    const draft = await upsertAnalysisDraft(supabase, {
      clip_id: clipId,
      serve_or_return: readServeOrReturn(formData),
      point_outcome: readOptionalText(formData, "pointOutcome", 200, "Point outcome"),
      primary_pattern: requireText(formData, "whatHappened", 5000, "What happened"),
      pressure_pattern_family: readOptionalText(
        formData,
        "pressurePatternFamily",
        1000,
        "Pressure pattern",
      ),
      likely_breakdown_moment: requireText(
        formData,
        "breakdownMoment",
        5000,
        "Breakdown moment",
      ),
      elite_comparison: requireText(
        formData,
        "eliteComparison",
        5000,
        "Elite comparison",
      ),
      next_time_adjustment: requireText(
        formData,
        "nextTimeAdjustment",
        5000,
        "Next-time adjustment",
      ),
      training_focus: requireText(formData, "trainingFocus", 5000, "Training focus"),
      coaching_takeaway: requireText(
        formData,
        "coachingTakeaway",
        5000,
        "Coaching takeaway",
      ),
      analysis_notes: readOptionalText(formData, "coachReviewNotes", 5000, "Coach review"),
      confidence_level: readConfidence(formData),
      tags: readTags(formData),
      status,
    });

    await updateClip(supabase, clipId, {
      analysis_status: "draft_ready",
      review_status:
        status === "approved"
          ? "reviewed"
          : status === "in_review"
            ? "in_review"
            : "unreviewed",
    });

    revalidatePath("/tagging");
    revalidatePath("/matches");
    revalidatePath("/reports");

    return {
      status: "success",
      message:
        status === "approved"
          ? "Coach review approved and analysis saved."
          : "Analysis draft saved to this clip.",
      savedClipId: clipId,
      savedDraftId: draft.id,
    };
  } catch (error) {
    if (error instanceof AnalysisInputError) {
      return { status: "error", message: error.message, savedClipId: clipId };
    }
    if (error instanceof SupabaseAuthenticationError) {
      return { status: "error", message: error.message, savedClipId: clipId };
    }
    if (error instanceof PlayerClipRepositoryError) {
      return {
        status: "error",
        message:
          error.code === "42501"
            ? "You do not have access to save analysis for this clip."
            : "The analysis draft could not be saved.",
        savedClipId: clipId,
      };
    }
    return {
      status: "error",
      message: "The analysis draft could not be saved.",
      savedClipId: clipId,
    };
  }
}

class AnalysisInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalysisInputError";
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
    throw new AnalysisInputError(`${label} is required.`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new AnalysisInputError(`${label} is too long.`);
  }
  return trimmed;
}

function requireUuid(formData: FormData, key: string, label: string): string {
  const value = requireText(formData, key, 36, label);
  if (!UUID_PATTERN.test(value)) {
    throw new AnalysisInputError(`${label} is invalid.`);
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
    throw new AnalysisInputError(`${label} must be text.`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new AnalysisInputError(`${label} is too long.`);
  }
  return trimmed || null;
}

function readEnum<const Value extends string>(
  formData: FormData,
  key: string,
  values: readonly Value[],
  label: string,
): Value {
  const value = requireText(formData, key, 50, label);
  if (!values.includes(value as Value)) {
    throw new AnalysisInputError(`${label} is invalid.`);
  }
  return value as Value;
}

function readServeOrReturn(
  formData: FormData,
): "Serve" | "Return" | "Unknown" | null {
  const value = readOptionalText(formData, "serveOrReturn", 20, "Serve or return");
  if (value === null) return null;
  if (value !== "Serve" && value !== "Return" && value !== "Unknown") {
    throw new AnalysisInputError("Serve or return is invalid.");
  }
  return value;
}

function readConfidence(
  formData: FormData,
): "Low" | "Medium" | "High" | null {
  const value = readOptionalText(formData, "confidenceLevel", 20, "Confidence");
  if (value === null) return null;
  if (value !== "Low" && value !== "Medium" && value !== "High") {
    return value.toLowerCase().startsWith("high") ? "High" : "Medium";
  }
  return value;
}

function readTags(formData: FormData): string[] {
  const value = readOptionalText(formData, "tags", 1000, "Tags");
  if (!value) return [];
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20);
}
