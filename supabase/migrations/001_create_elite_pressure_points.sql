create table public.elite_pressure_points (
  id text primary key,
  elite_player text not null,
  opponent text not null,
  match_tournament text,
  year integer,
  surface text,
  set_score text,
  game_score text,
  point_score text,
  pressure_trigger text not null,
  timestamp text,
  source_link text,
  clip_file_name text,
  player_to_analyze text,
  server_if_known text,
  uploader_note text,
  serve_or_return text,
  point_outcome text,
  first_serve_in text,
  rally_length integer,
  primary_pattern text not null,
  aggression_level text,
  risk_decision text,
  shot_that_decided_point text,
  error_or_winner_type text,
  reset_behavior text,
  body_language_note text,
  tactical_principle text,
  coaching_takeaway text,
  tags text[],
  confidence_level text not null,
  ai_notes text,
  review_status text not null,
  reviewer_correction text,
  approved_for_library boolean not null default false,
  point_pattern_family text not null,
  pattern_hierarchy text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint elite_pressure_points_confidence_level_check
    check (confidence_level in ('High', 'Medium', 'Low')),
  constraint elite_pressure_points_first_serve_in_check
    check (first_serve_in is null or first_serve_in in ('Yes', 'No', 'Unknown')),
  constraint elite_pressure_points_serve_or_return_check
    check (serve_or_return is null or serve_or_return in ('Serve', 'Return', 'Unknown')),
  constraint elite_pressure_points_pattern_family_check
    check (
      point_pattern_family in (
        'Early Initiative / First-Strike Dictation',
        'Sustained Pressure / Controlled Construction'
      )
    )
);

comment on table public.elite_pressure_points is
  'Reviewed elite pressure-point evidence. Write access will be limited to future admin/server workflows.';
comment on column public.elite_pressure_points.clip_file_name is
  'Reference metadata only. Video files must not be stored in this table.';

alter table public.elite_pressure_points enable row level security;

grant select on table public.elite_pressure_points to anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on table public.elite_pressure_points from anon, authenticated;

create policy "Reviewed approved elite pressure points are publicly readable"
  on public.elite_pressure_points
  for select
  to anon, authenticated
  using (
    approved_for_library = true
    and review_status = 'Reviewed'
  );

-- No anonymous or authenticated write policies are intentionally created here.
-- Writes will be added later through explicitly authorized admin/server workflows.
