# Supabase Backend Integration Plan

This document prepares the Pinpoint AI backend shape without connecting to Supabase. No Supabase client, credentials, auth flow, storage bucket, or upload pipeline should be added during this planning step.

## Implementation Order

`elite_pressure_points` should be the first table implemented. The current app already depends on the real local 20-point elite pressure dataset in `data/elite-pressure-points.json`, and the Elite Library uses the `ElitePressurePoint` contract from `src/lib/pinpoint-types.ts`. Moving this dataset first gives the backend a small, reviewed, high-value table to validate schema design, seed/import flow, filtering, and point-level supporting evidence before adding user-owned clips or generated reports.

The current local JSON dataset will eventually seed or import into `elite_pressure_points`. Until that migration exists, the app should keep reading local JSON.

## Proposed Tables

### organizations

Purpose: Tenant boundary for academies, coaches, or teams that will later own players, match sessions, clips, analysis drafts, and reports.

Key fields:
- `id`: UUID primary key.
- `name`: Organization display name.
- `slug`: Unique URL-safe identifier.
- `created_at`: Creation timestamp.
- `updated_at`: Last update timestamp.

Relationships:
- Has many `profiles`.
- Has many `players`.
- Has many `match_sessions`.
- Has many `clips`.
- Has many `analysis_drafts`.
- Has many `reports`.

TypeScript mapping: No current direct type. This is a future backend/account model.

### users / profiles

Purpose: Store app-specific user profile details linked to Supabase Auth users when authentication is added later.

Key fields:
- `id`: UUID primary key, matching the Supabase Auth user id.
- `organization_id`: Foreign key to `organizations.id`.
- `email`: User email for display and support workflows.
- `full_name`: User display name.
- `role`: Access role such as owner, coach, analyst, or viewer.
- `created_at`: Creation timestamp.
- `updated_at`: Last update timestamp.

Relationships:
- Belongs to `organizations`.
- May create `players`, `match_sessions`, `clips`, `analysis_drafts`, and `reports`.

TypeScript mapping: No current direct type. This is a future auth/profile model.

### players

Purpose: Represent real player records managed by a coach or organization.

Key fields:
- `id`: UUID primary key.
- `organization_id`: Foreign key to `organizations.id`.
- `display_name`: Player name.
- `dominant_hand`: Optional player metadata.
- `notes`: Optional coach notes.
- `created_by`: Foreign key to `profiles.id`.
- `created_at`: Creation timestamp.
- `updated_at`: Last update timestamp.

Relationships:
- Belongs to `organizations`.
- Has many `match_sessions`.
- Has many `clips`.
- Has many `reports`.

TypeScript mapping: Future `Player` concept. Current code mostly stores player names as strings in `ClipContext.playerName`, `ElitePressurePoint.elitePlayer`, `ElitePressurePoint.playerToAnalyze`, and `PlayerReport.playerName`.

### match_sessions

Purpose: Group clips and analysis around a match, practice set, tournament match, or review session.

Key fields:
- `id`: UUID primary key.
- `organization_id`: Foreign key to `organizations.id`.
- `player_id`: Foreign key to `players.id`.
- `title`: Session title.
- `opponent`: Optional opponent name.
- `event_name`: Optional tournament or practice event name.
- `surface`: Optional court surface.
- `session_date`: Optional match/session date.
- `created_by`: Foreign key to `profiles.id`.
- `created_at`: Creation timestamp.
- `updated_at`: Last update timestamp.

Relationships:
- Belongs to `organizations`.
- Belongs to `players`.
- Has many `clips`.
- Has many `analysis_drafts`.
- Has many `reports`.

TypeScript mapping: Future `MatchSession` concept. Current string field mapping exists in `ClipContext.matchSession` and `PlayerReport.matchSession`.

### clips

Purpose: Store point or sequence metadata for player video clips. Video files should later live in private Supabase Storage, not GitHub.

Key fields:
- `id`: UUID primary key.
- `organization_id`: Foreign key to `organizations.id`.
- `player_id`: Foreign key to `players.id`.
- `match_session_id`: Foreign key to `match_sessions.id`.
- `storage_bucket`: Private storage bucket name when uploads are implemented.
- `storage_path`: Private storage object path when uploads are implemented.
- `external_source_url`: Optional source link for non-uploaded references.
- `timestamp_or_range`: Clip timestamp or range inside the original video.
- `score_context`: Score text at the point.
- `pressure_trigger`: Pressure trigger enum value.
- `coach_note`: Coach-provided context.
- `created_by`: Foreign key to `profiles.id`.
- `created_at`: Creation timestamp.
- `updated_at`: Last update timestamp.

Relationships:
- Belongs to `organizations`.
- Belongs to `players`.
- Belongs to `match_sessions`.
- Has many `analysis_drafts`.

TypeScript mapping: `ClipContext` in `src/lib/pinpoint-types.ts`. A future split may keep clip metadata in `clips` and point-specific context in `clip_contexts` if clip files contain multiple points.

### elite_pressure_points

Purpose: Store reviewed elite point-level evidence for the Elite Library and future comparisons against player clips.

Key fields:
- `id`: Text or UUID primary key, aligned with the current dataset id during import.
- `elite_player`: Elite player name.
- `opponent`: Opponent name.
- `match_tournament`: Match or tournament name.
- `year`: Match year.
- `surface`: Court surface enum value.
- `set_score`: Set score.
- `game_score`: Game score.
- `point_score`: Point score.
- `pressure_trigger`: Pressure trigger enum value.
- `timestamp`: Source video timestamp.
- `source_link`: Source URL.
- `clip_file_name`: Optional reference name only; real video should not be committed.
- `player_to_analyze`: Player focus for the point.
- `server_if_known`: Server name if known.
- `uploader_note`: Dataset collection note.
- `serve_or_return`: Serve/return enum value.
- `point_outcome`: Point result.
- `first_serve_in`: Nullable boolean.
- `rally_length`: Nullable number.
- `primary_pattern`: Main tactical pattern.
- `aggression_level`: Aggression enum value.
- `risk_decision`: Risk decision enum value.
- `shot_that_decided_point`: Decisive shot.
- `error_or_winner_type`: Error/winner classification.
- `reset_behavior`: Between-point behavior.
- `body_language_note`: Body language observation.
- `tactical_principle`: Tactical principle.
- `coaching_takeaway`: Coaching takeaway.
- `tags`: Text array.
- `confidence_level`: Confidence enum value.
- `ai_notes`: Notes from review/import process.
- `review_status`: Review status enum value.
- `reviewer_correction`: Reviewer correction text.
- `approved_for_library`: Boolean gate for Elite Library inclusion.
- `point_pattern_family`: Generalized pressure tendency family.
- `pattern_hierarchy`: Pattern family plus subpattern detail.
- `created_at`: Import timestamp.
- `updated_at`: Last update timestamp.

Relationships:
- Can be referenced by `analysis_drafts` as supporting comparison evidence.
- Can be referenced by `reports` through generated comparison summaries or report evidence tables.

TypeScript mapping: `ElitePressurePoint` in `src/lib/pinpoint-types.ts`.

### analysis_drafts

Purpose: Store AI-assisted and human-reviewed draft analysis for player clips before final report generation.

Key fields:
- `id`: UUID primary key.
- `organization_id`: Foreign key to `organizations.id`.
- `clip_id`: Foreign key to `clips.id`.
- `serve_or_return`: Serve/return enum value.
- `point_outcome`: Point result.
- `first_serve_in`: Nullable boolean.
- `rally_length_estimate`: Nullable number.
- `primary_pattern`: Main tactical pattern.
- `aggression_level`: Aggression enum value.
- `risk_decision`: Risk decision enum value.
- `shot_that_decided_point`: Decisive shot.
- `error_or_winner_type`: Error/winner classification.
- `reset_behavior`: Between-point behavior.
- `body_language_note`: Body language observation.
- `tactical_principle`: Tactical principle.
- `coaching_takeaway`: Coaching takeaway.
- `tags`: Text array.
- `confidence_level`: Confidence enum value.
- `elite_comparison`: Summary of related elite patterns.
- `supporting_elite_point_ids`: Array of `elite_pressure_points.id` values or a join table later.
- `analysis_notes`: Reviewer/AI notes.
- `review_status`: Review status enum value.
- `created_by`: Foreign key to `profiles.id`.
- `created_at`: Creation timestamp.
- `updated_at`: Last update timestamp.

Relationships:
- Belongs to `organizations`.
- Belongs to `clips`.
- May reference many `elite_pressure_points`.
- Can feed many `reports`.

TypeScript mapping: `AIDraftAnalysis` in `src/lib/pinpoint-types.ts`.

### reports

Purpose: Store generated player reports after analysis drafts have been reviewed and compared against the Elite Library.

Key fields:
- `id`: UUID primary key.
- `organization_id`: Foreign key to `organizations.id`.
- `player_id`: Foreign key to `players.id`.
- `match_session_id`: Foreign key to `match_sessions.id`.
- `analysis_draft_ids`: Array of included `analysis_drafts.id` values or a join table later.
- `dominant_pressure_patterns`: Text array.
- `recurring_risks`: Text array.
- `elite_comparisons`: Text array.
- `coaching_priorities`: Text array.
- `created_by`: Foreign key to `profiles.id`.
- `created_at`: Creation timestamp.
- `updated_at`: Last update timestamp.

Relationships:
- Belongs to `organizations`.
- Belongs to `players`.
- Belongs to `match_sessions`.
- Generated from reviewed `analysis_drafts`.
- Uses Elite Library comparisons backed by `elite_pressure_points`.

TypeScript mapping: `PlayerReport` in `src/lib/pinpoint-types.ts`.

## Storage Notes

Player clips should later use private Supabase Storage with database metadata in `clips`. Video files must not be committed to GitHub. Storage design should include private buckets, signed upload/download URLs, file ownership through `organization_id`, and processing status only when the upload pipeline is added.

## Report Generation Notes

Reports should later be generated from reviewed `analysis_drafts` and Elite Library comparisons. The report pipeline should preserve point-level supporting evidence so coach-facing summaries can trace back to the underlying clip and elite comparison points.
