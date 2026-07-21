# Supabase Player Clip Setup

This is a manual setup guide for the player-clip workflow foundation. The migration is not applied by the application and must not be applied until its schema and access model have been reviewed.

## 1. Review and manually apply the migration

Review `supabase/migrations/002_create_player_clip_workflow.sql`, especially:

- foreign-key deletion behavior;
- status values and file constraints;
- the `created_by` references to `auth.users`;
- the absence of RLS policies;
- the grants to `authenticated`, which are still denied by RLS until policies exist.

After review, apply the migration manually through the Supabase SQL Editor or the team's normal migration workflow. Do not paste credentials into the migration or run it from client-side code.

The migration creates `players`, `match_sessions`, `clips`, `analysis_drafts`, `reports`, and `report_clips`. RLS is enabled on every table. It creates no policies, so all table access is denied by default. Anonymous table privileges are explicitly revoked.

## 2. Create the private Storage bucket

In the Supabase Dashboard, open **Storage**, create a bucket named `player-clips`, and configure it as follows:

- Public bucket: **off** (private)
- Maximum file size: **100 MB** (`104857600` bytes)
- Allowed MIME types:
  - `video/mp4`
  - `video/quicktime`
  - `video/webm`

Do not store player videos in a public bucket and do not use `getPublicUrl` for playback.

The upload route stores objects under an authenticated-user prefix, but that path convention is not an authorization policy. Storage access remains blocked until the team adds reviewed `storage.objects` policies based on the final ownership or tenant model.

## 3. Configure server environment values

The server foundation uses only the existing public Supabase values:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

These values identify the project and are safe to expose by design. Authorization comes from the caller's verified Supabase access token plus RLS. Do not add, expose, or use a service-role key for these routes.

## 4. Authentication and RLS limitation

The current app has no sign-in/session integration and no approved user-to-player or tenant ownership rules. For that reason:

- all reads and writes remain blocked until Supabase Auth and ownership policies are implemented;
- the upload and repository code is infrastructure-ready, but it cannot securely function yet;
- the migration defines no database RLS policies;
- this setup defines no `storage.objects` policies;
- the upload and signed-playback routes require an `Authorization: Bearer <Supabase access token>` header;
- a valid token is verified with Supabase Auth before any file or row operation;
- valid authenticated requests will still be denied by RLS until narrowly scoped database and Storage policies are reviewed and added in a later migration.

This fail-closed behavior is intentional. Do not add `USING (true)`, `WITH CHECK (true)`, anonymous write access, or a service-role bypass to make the prototype work.

The next required milestone is Supabase Auth. Future table and Storage ownership policies should be narrowly scoped around `created_by = auth.uid()` (with equivalent ownership checks through related rows where a Storage object has no `created_by` column). Until those policies are implemented and reviewed, the workflow must remain blocked rather than bypass RLS.

## 5. Private upload and playback flow

Once authentication and scoped RLS policies exist:

1. Send a `multipart/form-data` `POST` to `/api/clips/upload` with `file`, `playerId`, `matchSessionId`, and `title`. Optional fields are `timestampOrRange`, `scoreContext`, `pressureTrigger`, `playerPointOutcome`, and `coachNote`.
2. The route verifies the bearer token, validates type and size, creates a pending `clips` row, uploads to the private `player-clips` bucket, and marks the row ready.
3. Request `/api/clips/[clipId]/signed-url` with the same bearer token.
4. The server reads the clip through RLS and returns a short-lived signed URL (five minutes by default).

Signed URLs are temporary secrets. Do not log, persist, or place them in reports. Request a fresh signed URL when playback needs one.
The `player-clips` bucket must remain private, and all playback must use short-lived signed URLs.

## 6. Testing checklist

Before authentication/RLS policies are added:

1. Run `npm.cmd run lint` and `npm.cmd run build`.
2. Confirm an upload without `Authorization` returns `401`.
3. Confirm a signed-URL request without `Authorization` returns `401`.
4. With a valid token, confirm database/Storage access remains denied by RLS rather than bypassed.
5. In the Dashboard, confirm the bucket is private, limited to 100 MB, and has only the three allowed video MIME types.
6. Confirm no public video URL is generated or usable.

After reviewed database and Storage policies are added:

1. Upload one small MP4, QuickTime, and WebM fixture as an authorized user.
2. Confirm unsupported MIME types are rejected with `415` and files over 100 MB with `413`.
3. Confirm the `clips` row moves from `pending` to `ready`; force a failed upload and confirm it moves to `failed`.
4. Confirm the authorized user can request a signed playback URL and that it expires.
5. Confirm anonymous users and unrelated authenticated users cannot read, insert, update, delete, upload, or sign the clip.
6. Inspect `pg_policies` and Storage policies to ensure there are no unrestricted write conditions.
