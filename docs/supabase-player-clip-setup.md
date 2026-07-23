# Supabase Player Clip Setup

This is the manual setup guide for the player-clip workflow. Migrations 002 and 003 have been applied and tested. Migration 004 is prepared in the repository but has not been applied; until it is reviewed and applied, the private Storage bucket and object policies do not exist.

See `docs/supabase-auth-and-rls.md` for the complete authentication flow, all policy names, relational ownership rules, and cross-user verification steps.

## 1. Current migration state

These table migrations were applied successfully:

1. `supabase/migrations/002_create_player_clip_workflow.sql`
2. `supabase/migrations/003_add_player_workflow_rls_policies.sql`

Migration 002 creates `players`, `match_sessions`, `clips`, `analysis_drafts`, `reports`, and `report_clips`. It enables RLS and revokes anonymous privileges. Migration 003 adds authenticated ownership policies for those tables.

The next migration is review-only and is not applied:

3. `supabase/migrations/004_create_private_player_clip_storage.sql`

Migration 004 creates the private `player-clips` bucket and ownership-scoped `storage.objects` policies. The application never applies migrations.

## 2. Configure the private pilot login

Email/password sessions now use `@supabase/ssr` and cookies. A Next.js proxy refreshes sessions, protected application pages redirect to `/sign-in`, and player workflow Route Handlers verify the user again on the server.

In the Supabase Dashboard:

- enable the Email provider;
- disable new-user sign-up and anonymous sign-ins for the private pilot;
- create and confirm pilot users manually under **Authentication > Users**;
- configure the Site URL and allowed redirect URLs for local and deployed origins.

The app intentionally provides no public sign-up page.

## 3. Configure environment values

The browser and server use only:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Do not add a service-role/secret key to browser code, do not prefix one with `NEXT_PUBLIC_`, and do not log environment values. The public Elite Library continues to use its non-session server client and local-data fallback.

## 4. Review and apply private Storage migration 004

Migration 004 creates or locks down a bucket named `player-clips` with:

- Public bucket: **off** (private)
- Maximum file size: **100 MB** (`104857600` bytes)
- Allowed MIME types:
  - `video/mp4`
  - `video/quicktime`
  - `video/webm`

Objects use `<authenticated-user-id>/<match-session-id>/<unique-file-name>`. INSERT requires the Storage owner, authenticated-user prefix, and owned match-session folder. SELECT is limited by Storage operation: upload metadata may be returned for that owned session, while signing a playback URL additionally requires an exact owned `clips` row. DELETE remains owner- and prefix-scoped so the route can compensate if the later database insert fails. There is intentionally no UPDATE policy: uploads use generated paths with `upsert: false`, so footage cannot be overwritten in place.

Review the migration, then apply it manually through the team migration workflow or Supabase SQL Editor. Do not create the bucket separately in the Dashboard unless the migration is adjusted to match that deployment process.

Never use `getPublicUrl` for player clips. Playback must use short-lived signed URLs after both row and Storage ownership have been verified.

## 5. Prepared upload and playback flow

Once migration 004 has been reviewed and manually applied:

1. Sign in through `/sign-in`; the browser receives the SSR session cookies.
2. Open `/clips/upload`, choose an owned player and match session, select an MP4, MOV, or WebM file up to 100 MB, and submit. The interface sends same-origin `multipart/form-data` to `/api/clips/upload` and reports upload progress.
3. The route verifies the cookie session, derives `created_by` and the object path from the authenticated user, validates exactly one file, and checks the owned match/player relationship. It uploads first, creates a ready clip row only after Storage succeeds, and removes the object if database insertion fails.
4. Request `/api/clips/[clipId]/signed-url` with the same cookie session.
5. The route reads the clip through RLS and returns a five-minute signed URL.

Do not accept `created_by` from request data. Signed URLs are temporary secrets and must not be logged, persisted, or embedded in reports.

## 6. Migration 004 and workflow verification

Before applying migration 004:

1. Run `npm.cmd run lint` and `npm.cmd run build`.
2. Confirm `/sign-in` exists and invalid credentials show an accessible error.
3. Confirm signed-out protected pages redirect to sign-in without a loop.
4. Confirm signed-out player workflow APIs return `401`.
5. Inspect all repository insert/upsert functions and confirm they derive `created_by` with `getAuthenticatedUserId`.
6. Confirm there is no service-role credential use and no environment-value logging.
7. Confirm migration 004 contains no unrestricted policy and no Storage UPDATE policy.
8. Confirm migration 004 has not been applied and no bucket was created by the application.

After migration 004 is applied, test allowed MIME types and file signatures, the 100 MB limit, failed-upload cleanup, signed-URL expiry, and cross-user object denial. Also confirm the project-level Supabase Storage limit is at least as large as the bucket limit; Supabase Free projects may impose a lower global limit.
