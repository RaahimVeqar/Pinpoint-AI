-- Player clip workflow foundation.
--
-- This migration intentionally creates no RLS policies. The application does
-- not yet have an authenticated ownership/tenant model, so all access remains
-- denied through RLS until narrowly scoped policies are reviewed separately.

create table public.players (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (length(btrim(display_name)) > 0),
  dominant_hand text check (dominant_hand is null or dominant_hand in ('left', 'right', 'ambidextrous')),
  notes text,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.match_sessions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete restrict,
  title text not null check (length(btrim(title)) > 0),
  opponent text,
  event_name text,
  surface text check (surface is null or surface in ('Hard', 'Clay', 'Grass', 'Indoor Hard')),
  session_date date,
  notes text,
  status text not null default 'draft'
    check (status in ('draft', 'in_progress', 'completed', 'archived')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clips (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete restrict,
  match_session_id uuid not null references public.match_sessions(id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  storage_bucket text not null default 'player-clips'
    check (storage_bucket = 'player-clips'),
  storage_path text not null unique check (length(btrim(storage_path)) > 0),
  original_file_name text not null check (length(btrim(original_file_name)) > 0),
  mime_type text not null
    check (mime_type in ('video/mp4', 'video/quicktime', 'video/webm')),
  file_size_bytes bigint not null
    check (file_size_bytes > 0 and file_size_bytes <= 104857600),
  timestamp_or_range text,
  score_context text,
  pressure_trigger text check (
    pressure_trigger is null
    or pressure_trigger in (
      '30-30',
      'Deuce',
      'Advantage',
      'Break Point',
      'Set Point',
      'Match Point',
      'Tiebreak'
    )
  ),
  player_point_outcome text check (
    player_point_outcome is null
    or player_point_outcome in ('Won', 'Lost', 'Unknown')
  ),
  coach_note text,
  upload_status text not null default 'pending'
    check (upload_status in ('pending', 'uploading', 'ready', 'failed')),
  analysis_status text not null default 'not_started'
    check (analysis_status in ('not_started', 'processing', 'draft_ready', 'reviewed', 'failed')),
  review_status text not null default 'unreviewed'
    check (review_status in ('unreviewed', 'in_review', 'reviewed', 'rejected')),
  upload_error text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.analysis_drafts (
  id uuid primary key default gen_random_uuid(),
  clip_id uuid not null references public.clips(id) on delete cascade,
  serve_or_return text check (
    serve_or_return is null or serve_or_return in ('Serve', 'Return', 'Unknown')
  ),
  point_outcome text,
  first_serve_in boolean,
  rally_length_estimate integer check (
    rally_length_estimate is null or rally_length_estimate >= 0
  ),
  primary_pattern text,
  pressure_pattern_family text,
  likely_breakdown_moment text,
  decision_quality text,
  execution_quality text,
  missed_opportunity text,
  elite_reference_pattern text,
  aggression_level text check (
    aggression_level is null or aggression_level in ('Controlled', 'Balanced', 'High')
  ),
  risk_decision text check (
    risk_decision is null or risk_decision in ('Conservative', 'Calculated', 'Aggressive')
  ),
  shot_that_decided_point text,
  error_or_winner_type text,
  reset_behavior text,
  body_language_note text,
  tactical_principle text,
  coaching_takeaway text,
  tags text[] not null default '{}',
  confidence_level text check (
    confidence_level is null or confidence_level in ('Low', 'Medium', 'High')
  ),
  elite_comparison text,
  next_time_adjustment text,
  training_focus text,
  analysis_notes text,
  status text not null default 'draft'
    check (status in ('draft', 'in_review', 'approved', 'rejected')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clip_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete restrict,
  match_session_id uuid references public.match_sessions(id) on delete set null,
  title text not null check (length(btrim(title)) > 0),
  overall_pressure_tendency text,
  dominant_pressure_patterns text[] not null default '{}',
  recurring_breakdowns text[] not null default '{}',
  elite_comparison_summary text,
  coaching_priorities text[] not null default '{}',
  next_session_focus text,
  status text not null default 'draft'
    check (status in ('draft', 'finalized', 'archived')),
  finalized_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reports_finalized_at_check check (
    (status = 'finalized' and finalized_at is not null)
    or (status <> 'finalized' and finalized_at is null)
  )
);

create table public.report_clips (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  clip_id uuid not null references public.clips(id) on delete cascade,
  analysis_draft_id uuid references public.analysis_drafts(id) on delete set null,
  display_order integer not null default 0 check (display_order >= 0),
  status text not null default 'included'
    check (status in ('included', 'excluded')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (report_id, clip_id)
);

create index players_created_by_idx on public.players(created_by);
create index players_status_idx on public.players(status);
create index match_sessions_player_id_idx on public.match_sessions(player_id);
create index match_sessions_created_by_idx on public.match_sessions(created_by);
create index match_sessions_status_date_idx on public.match_sessions(status, session_date desc);
create index clips_player_id_idx on public.clips(player_id);
create index clips_match_session_id_idx on public.clips(match_session_id);
create index clips_created_by_idx on public.clips(created_by);
create index clips_upload_status_idx on public.clips(upload_status);
create index clips_analysis_status_idx on public.clips(analysis_status);
create index clips_review_status_idx on public.clips(review_status);
create index analysis_drafts_created_by_idx on public.analysis_drafts(created_by);
create index analysis_drafts_status_idx on public.analysis_drafts(status);
create index reports_player_id_idx on public.reports(player_id);
create index reports_match_session_id_idx on public.reports(match_session_id);
create index reports_created_by_idx on public.reports(created_by);
create index reports_status_idx on public.reports(status);
create index report_clips_report_order_idx on public.report_clips(report_id, display_order);
create index report_clips_clip_id_idx on public.report_clips(clip_id);
create index report_clips_analysis_draft_id_idx on public.report_clips(analysis_draft_id);
create index report_clips_created_by_idx on public.report_clips(created_by);

create or replace function public.set_player_clip_workflow_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger players_set_updated_at
  before update on public.players
  for each row execute function public.set_player_clip_workflow_updated_at();

create trigger match_sessions_set_updated_at
  before update on public.match_sessions
  for each row execute function public.set_player_clip_workflow_updated_at();

create trigger clips_set_updated_at
  before update on public.clips
  for each row execute function public.set_player_clip_workflow_updated_at();

create trigger analysis_drafts_set_updated_at
  before update on public.analysis_drafts
  for each row execute function public.set_player_clip_workflow_updated_at();

create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function public.set_player_clip_workflow_updated_at();

create trigger report_clips_set_updated_at
  before update on public.report_clips
  for each row execute function public.set_player_clip_workflow_updated_at();

alter table public.players enable row level security;
alter table public.match_sessions enable row level security;
alter table public.clips enable row level security;
alter table public.analysis_drafts enable row level security;
alter table public.reports enable row level security;
alter table public.report_clips enable row level security;

revoke all on table public.players from anon;
revoke all on table public.match_sessions from anon;
revoke all on table public.clips from anon;
revoke all on table public.analysis_drafts from anon;
revoke all on table public.reports from anon;
revoke all on table public.report_clips from anon;

grant select, insert, update, delete on table public.players to authenticated;
grant select, insert, update, delete on table public.match_sessions to authenticated;
grant select, insert, update, delete on table public.clips to authenticated;
grant select, insert, update, delete on table public.analysis_drafts to authenticated;
grant select, insert, update, delete on table public.reports to authenticated;
grant select, insert, update, delete on table public.report_clips to authenticated;

-- Intentionally no policies. RLS therefore denies all access, including for
-- authenticated users, until the app has an approved ownership/tenant model.
