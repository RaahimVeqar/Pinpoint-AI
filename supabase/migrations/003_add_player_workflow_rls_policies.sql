-- Authenticated ownership policies for the player clip workflow.
-- Review this migration together with 002 before applying either migration.

-- Players -------------------------------------------------------------------

create policy "players_select_own"
on public.players
for select
to authenticated
using (created_by = (select auth.uid()));

create policy "players_insert_own"
on public.players
for insert
to authenticated
with check (created_by = (select auth.uid()));

create policy "players_update_own"
on public.players
for update
to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));

create policy "players_delete_own"
on public.players
for delete
to authenticated
using (created_by = (select auth.uid()));

-- Match sessions ------------------------------------------------------------

create policy "match_sessions_select_own"
on public.match_sessions
for select
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.players as player
    where player.id = match_sessions.player_id
      and player.created_by = (select auth.uid())
  )
);

create policy "match_sessions_insert_own"
on public.match_sessions
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.players as player
    where player.id = match_sessions.player_id
      and player.created_by = (select auth.uid())
  )
);

create policy "match_sessions_update_own"
on public.match_sessions
for update
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.players as player
    where player.id = match_sessions.player_id
      and player.created_by = (select auth.uid())
  )
)
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.players as player
    where player.id = match_sessions.player_id
      and player.created_by = (select auth.uid())
  )
);

create policy "match_sessions_delete_own"
on public.match_sessions
for delete
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.players as player
    where player.id = match_sessions.player_id
      and player.created_by = (select auth.uid())
  )
);

-- Clips ---------------------------------------------------------------------

create policy "clips_select_own"
on public.clips
for select
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.players as player
    join public.match_sessions as session
      on session.player_id = player.id
    where player.id = clips.player_id
      and session.id = clips.match_session_id
      and player.created_by = (select auth.uid())
      and session.created_by = (select auth.uid())
  )
);

create policy "clips_insert_own"
on public.clips
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.players as player
    join public.match_sessions as session
      on session.player_id = player.id
    where player.id = clips.player_id
      and session.id = clips.match_session_id
      and player.created_by = (select auth.uid())
      and session.created_by = (select auth.uid())
  )
);

create policy "clips_update_own"
on public.clips
for update
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.players as player
    join public.match_sessions as session
      on session.player_id = player.id
    where player.id = clips.player_id
      and session.id = clips.match_session_id
      and player.created_by = (select auth.uid())
      and session.created_by = (select auth.uid())
  )
)
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.players as player
    join public.match_sessions as session
      on session.player_id = player.id
    where player.id = clips.player_id
      and session.id = clips.match_session_id
      and player.created_by = (select auth.uid())
      and session.created_by = (select auth.uid())
  )
);

create policy "clips_delete_own"
on public.clips
for delete
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.players as player
    join public.match_sessions as session
      on session.player_id = player.id
    where player.id = clips.player_id
      and session.id = clips.match_session_id
      and player.created_by = (select auth.uid())
      and session.created_by = (select auth.uid())
  )
);

-- Analysis drafts -----------------------------------------------------------

create policy "analysis_drafts_select_own"
on public.analysis_drafts
for select
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.clips as clip
    where clip.id = analysis_drafts.clip_id
      and clip.created_by = (select auth.uid())
  )
);

create policy "analysis_drafts_insert_own"
on public.analysis_drafts
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.clips as clip
    where clip.id = analysis_drafts.clip_id
      and clip.created_by = (select auth.uid())
  )
);

create policy "analysis_drafts_update_own"
on public.analysis_drafts
for update
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.clips as clip
    where clip.id = analysis_drafts.clip_id
      and clip.created_by = (select auth.uid())
  )
)
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.clips as clip
    where clip.id = analysis_drafts.clip_id
      and clip.created_by = (select auth.uid())
  )
);

create policy "analysis_drafts_delete_own"
on public.analysis_drafts
for delete
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.clips as clip
    where clip.id = analysis_drafts.clip_id
      and clip.created_by = (select auth.uid())
  )
);

-- Reports -------------------------------------------------------------------

create policy "reports_select_own"
on public.reports
for select
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.players as player
    where player.id = reports.player_id
      and player.created_by = (select auth.uid())
  )
  and (
    match_session_id is null
    or exists (
      select 1
      from public.match_sessions as session
      where session.id = reports.match_session_id
        and session.player_id = reports.player_id
        and session.created_by = (select auth.uid())
    )
  )
);

create policy "reports_insert_own"
on public.reports
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.players as player
    where player.id = reports.player_id
      and player.created_by = (select auth.uid())
  )
  and (
    match_session_id is null
    or exists (
      select 1
      from public.match_sessions as session
      where session.id = reports.match_session_id
        and session.player_id = reports.player_id
        and session.created_by = (select auth.uid())
    )
  )
);

create policy "reports_update_own"
on public.reports
for update
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.players as player
    where player.id = reports.player_id
      and player.created_by = (select auth.uid())
  )
  and (
    match_session_id is null
    or exists (
      select 1
      from public.match_sessions as session
      where session.id = reports.match_session_id
        and session.player_id = reports.player_id
        and session.created_by = (select auth.uid())
    )
  )
)
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.players as player
    where player.id = reports.player_id
      and player.created_by = (select auth.uid())
  )
  and (
    match_session_id is null
    or exists (
      select 1
      from public.match_sessions as session
      where session.id = reports.match_session_id
        and session.player_id = reports.player_id
        and session.created_by = (select auth.uid())
    )
  )
);

create policy "reports_delete_own"
on public.reports
for delete
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.players as player
    where player.id = reports.player_id
      and player.created_by = (select auth.uid())
  )
  and (
    match_session_id is null
    or exists (
      select 1
      from public.match_sessions as session
      where session.id = reports.match_session_id
        and session.player_id = reports.player_id
        and session.created_by = (select auth.uid())
    )
  )
);

-- Report clips --------------------------------------------------------------

create policy "report_clips_select_own"
on public.report_clips
for select
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.reports as report
    join public.clips as clip
      on clip.id = report_clips.clip_id
      and clip.player_id = report.player_id
      and (
        report.match_session_id is null
        or clip.match_session_id = report.match_session_id
      )
    left join public.analysis_drafts as draft
      on draft.id = report_clips.analysis_draft_id
    where report.id = report_clips.report_id
      and report.created_by = (select auth.uid())
      and clip.created_by = (select auth.uid())
      and (
        report_clips.analysis_draft_id is null
        or (
          draft.id is not null
          and draft.clip_id = clip.id
          and draft.created_by = (select auth.uid())
        )
      )
  )
);

create policy "report_clips_insert_own"
on public.report_clips
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.reports as report
    join public.clips as clip
      on clip.id = report_clips.clip_id
      and clip.player_id = report.player_id
      and (
        report.match_session_id is null
        or clip.match_session_id = report.match_session_id
      )
    left join public.analysis_drafts as draft
      on draft.id = report_clips.analysis_draft_id
    where report.id = report_clips.report_id
      and report.created_by = (select auth.uid())
      and clip.created_by = (select auth.uid())
      and (
        report_clips.analysis_draft_id is null
        or (
          draft.id is not null
          and draft.clip_id = clip.id
          and draft.created_by = (select auth.uid())
        )
      )
  )
);

create policy "report_clips_update_own"
on public.report_clips
for update
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.reports as report
    join public.clips as clip
      on clip.id = report_clips.clip_id
      and clip.player_id = report.player_id
      and (
        report.match_session_id is null
        or clip.match_session_id = report.match_session_id
      )
    left join public.analysis_drafts as draft
      on draft.id = report_clips.analysis_draft_id
    where report.id = report_clips.report_id
      and report.created_by = (select auth.uid())
      and clip.created_by = (select auth.uid())
      and (
        report_clips.analysis_draft_id is null
        or (
          draft.id is not null
          and draft.clip_id = clip.id
          and draft.created_by = (select auth.uid())
        )
      )
  )
)
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.reports as report
    join public.clips as clip
      on clip.id = report_clips.clip_id
      and clip.player_id = report.player_id
      and (
        report.match_session_id is null
        or clip.match_session_id = report.match_session_id
      )
    left join public.analysis_drafts as draft
      on draft.id = report_clips.analysis_draft_id
    where report.id = report_clips.report_id
      and report.created_by = (select auth.uid())
      and clip.created_by = (select auth.uid())
      and (
        report_clips.analysis_draft_id is null
        or (
          draft.id is not null
          and draft.clip_id = clip.id
          and draft.created_by = (select auth.uid())
        )
      )
  )
);

create policy "report_clips_delete_own"
on public.report_clips
for delete
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.reports as report
    join public.clips as clip
      on clip.id = report_clips.clip_id
      and clip.player_id = report.player_id
      and (
        report.match_session_id is null
        or clip.match_session_id = report.match_session_id
      )
    left join public.analysis_drafts as draft
      on draft.id = report_clips.analysis_draft_id
    where report.id = report_clips.report_id
      and report.created_by = (select auth.uid())
      and clip.created_by = (select auth.uid())
      and (
        report_clips.analysis_draft_id is null
        or (
          draft.id is not null
          and draft.clip_id = clip.id
          and draft.created_by = (select auth.uid())
        )
      )
  )
);
