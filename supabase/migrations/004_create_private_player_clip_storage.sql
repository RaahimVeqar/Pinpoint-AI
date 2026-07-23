-- Private Supabase Storage for authenticated player clips.
--
-- This migration is intentionally reviewable and must be applied manually.
-- It creates a private bucket and grants the minimum object operations used by
-- the application: insert, upload metadata selection, signed playback, and
-- delete.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'player-clips',
  'player-clips',
  false,
  104857600,
  array['video/mp4', 'video/quicktime', 'video/webm']::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage assigns object ownership from the authenticated JWT. The first path
-- segment must repeat that user ID. On INSERT, the second segment must identify
-- an RLS-visible match session owned by the same user. The upload operation also
-- needs narrowly scoped SELECT access so Storage can return the inserted object
-- metadata before the application creates the ready clips row.
--
-- Required path shape:
--   <authenticated-user-id>/<match-session-id>/<unique-file-name>

create policy "player_clips_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'player-clips'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.match_sessions as session
    where session.id::text = (storage.foldername(name))[2]
      and session.created_by = (select auth.uid())
  )
);

create policy "player_clips_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'player-clips'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (
    (
      storage.allow_only_operation('storage.object.upload')
      and exists (
        select 1
        from public.match_sessions as session
        where session.id::text = (storage.foldername(name))[2]
          and session.created_by = (select auth.uid())
      )
    )
    or (
      storage.allow_only_operation('storage.object.sign')
      and exists (
        select 1
        from public.clips as clip
        where clip.storage_bucket = 'player-clips'
          and clip.storage_path = name
          and clip.created_by = (select auth.uid())
          and clip.match_session_id::text = (storage.foldername(name))[2]
      )
    )
  )
);

create policy "player_clips_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'player-clips'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- No UPDATE policy is intentional. Uploads use unique object paths with
-- upsert disabled, so footage cannot be overwritten in place.
