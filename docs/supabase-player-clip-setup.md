# Supabase Player Clip Setup

This is the manual setup guide for the player-clip workflow. Authentication and table ownership policies are prepared in code, but neither migration has been applied automatically and the private Storage bucket has not been created.

See `docs/supabase-auth-and-rls.md` for the complete authentication flow, all policy names, relational ownership rules, and cross-user verification steps.

## 1. Review migrations; do not apply yet

Review these files in order:

1. `supabase/migrations/002_create_player_clip_workflow.sql`
2. `supabase/migrations/003_add_player_workflow_rls_policies.sql`

Migration 002 creates `players`, `match_sessions`, `clips`, `analysis_drafts`, `reports`, and `report_clips`. It enables RLS, revokes anonymous privileges, and initially leaves all operations blocked.

Migration 003 adds authenticated, ownership-scoped SELECT, INSERT, UPDATE, and DELETE policies. Every row requires `created_by = auth.uid()`, and child rows additionally validate their player/session/clip/report relationships so records from different owners cannot be connected.

**Do not apply either migration until both have been reviewed.** When approved, apply 002 before 003 through the Supabase SQL Editor or the team's normal migration workflow. The application never applies migrations.

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

## 4. Create the private Storage bucket (next reviewed step)

The bucket does not exist yet. After the team reviews the Storage access model, open **Storage** and create a bucket named `player-clips` with:

- Public bucket: **off** (private)
- Maximum file size: **100 MB** (`104857600` bytes)
- Allowed MIME types:
  - `video/mp4`
  - `video/quicktime`
  - `video/webm`

The upload route stores objects below a verified authenticated-user prefix, but a path prefix is not an authorization policy. This repository still contains no `storage.objects` policies, so object upload and playback should remain blocked until a reviewed Storage migration is added.

Never use `getPublicUrl` for player clips. Playback must use short-lived signed URLs after both row and Storage ownership have been verified.

## 5. Prepared upload and playback flow

Once migrations 002 and 003 and future private Storage policies have all been reviewed and manually applied:

1. Sign in through `/sign-in`; the browser receives the SSR session cookies.
2. Send a same-origin `multipart/form-data` `POST` to `/api/clips/upload` with `file`, `playerId`, `matchSessionId`, and `title`. Optional fields are `timestampOrRange`, `scoreContext`, `pressureTrigger`, `playerPointOutcome`, and `coachNote`.
3. The route verifies the cookie session, derives `created_by` and the object-path prefix from the authenticated user, validates the file, checks the owned match/player relationship, creates a pending row, uploads, and marks the row ready.
4. Request `/api/clips/[clipId]/signed-url` with the same cookie session.
5. The route reads the clip through RLS and returns a five-minute signed URL.

Do not accept `created_by` from request data. Signed URLs are temporary secrets and must not be logged, persisted, or embedded in reports.

## 6. Verification checklist

Before applying migrations:

1. Run `npm.cmd run lint` and `npm.cmd run build`.
2. Confirm `/sign-in` exists and invalid credentials show an accessible error.
3. Confirm signed-out protected pages redirect to sign-in without a loop.
4. Confirm signed-out player workflow APIs return `401`.
5. Inspect all repository insert/upsert functions and confirm they derive `created_by` with `getAuthenticatedUserId`.
6. Confirm there is no service-role credential use and no environment-value logging.
7. Confirm migration 003 contains no `USING (true)` or `WITH CHECK (true)`.
8. Confirm no migration was applied and no bucket was created by the application.

After reviewed table migrations are applied, use two authenticated users to run the cross-user isolation test in `docs/supabase-auth-and-rls.md`. After reviewed Storage policies are separately applied, test allowed MIME types, the 100 MB limit, failed-upload state, signed-URL expiry, and cross-user object denial.
