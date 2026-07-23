# Supabase Authentication and Player Workflow RLS

> **Current state:** Migrations 002 and 003 have been applied and tested. Migration 004 is prepared but has not been applied. The application never applies migrations; do not apply Storage policies merely to bypass an authorization error.

## Authentication configuration

Pinpoint AI uses email/password authentication for a private pilot. It intentionally has no public sign-up page.

In the Supabase Dashboard:

1. Open **Authentication > Sign In / Providers > Email** and confirm the Email provider is enabled.
2. In the Auth configuration, turn **Allow new users to sign up** off for the private pilot.
3. Keep anonymous sign-ins disabled.
4. Decide whether pilot users must confirm email. A manually created and confirmed user can sign in immediately.
5. Under **Authentication > URL Configuration**, set the production Site URL and add the local and deployed application origins as allowed redirect URLs if later flows use email links.

The app requires only:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Never put a Supabase secret/service-role key in a `NEXT_PUBLIC_` variable or browser bundle. No service-role credential is used by this implementation.

### Create a pilot user manually

1. Open **Authentication > Users**.
2. Select **Add user**.
3. Create a user with an email and password (or send an invitation if SMTP and the application callback flow are configured).
4. Ensure the email is confirmed before testing password sign-in.
5. Repeat with a second, separate user to verify isolation.

No application sign-up route is included. This keeps account provisioning under pilot administrator control.

## Session architecture

- `@supabase/ssr` stores the Supabase access and refresh session in cookies so Server Components, Server Actions, Route Handlers, and the browser share the same user session.
- Root `proxy.ts` calls `src/lib/supabase/proxy.ts` on application requests. It validates the user with `auth.getUser()`, refreshes expiring sessions, and copies refreshed cookies to the response.
- `src/lib/supabase/authenticated-server.ts` creates a cookie-aware server client and provides `getAuthenticatedUser`, `getAuthenticatedUserId`, and `requireAuthenticatedUser`.
- `src/lib/supabase/browser.ts` is the browser client utility for future authenticated Client Component queries. It uses only the public project URL and publishable key.
- `src/lib/supabase/server.ts` remains a non-session server client for the public Elite Library path. It does not log environment values.
- Server authorization uses `auth.getUser()`, not a locally trusted session payload.

The sign-in form posts to a Server Action. The action calls `signInWithPassword`, writes the returned session through the cookie adapter, and redirects only to a validated same-origin path. The sign-out Server Action calls `auth.signOut()` and redirects to `/sign-in`.

## Protected routes

The proxy requires authentication for these route prefixes:

- `/players`
- `/matches` (including `/matches/[clipId]` when that route exists)
- `/clips` (including the real upload workflow at `/clips/upload`)
- `/tagging`
- `/reports`
- `/dashboard`
- `/pipeline`
- `/dataset`

It also returns `401` JSON for unauthenticated `/api/analyze-clip` and `/api/clips/**` requests. The clip Route Handlers independently call `requireAuthenticatedUser`, so the API does not rely only on route interception.

Unauthenticated page requests redirect to `/sign-in?next=<same-origin-path>`. Invalid or cross-origin `next` values fall back to `/players`, preventing redirect loops and open redirects. Authenticated users who visit `/sign-in` are sent to the validated destination or `/players`.

The homepage and `/elite-library` remain public. Protected navigation links may remain visible, but the proxy enforces access when followed.

## Server-assigned `created_by`

Create/upsert inputs exposed by the player workflow repositories no longer accept `created_by`. Before an insert, each repository calls `getAuthenticatedUserId(supabase)`, which verifies the caller with Supabase Auth, then writes:

```ts
{ ...input, created_by: authenticatedUserId }
```

This applies to:

- `createPlayer`
- `createMatchSession`
- `createClip`
- `upsertAnalysisDraft`
- `createReport`
- `attachReportClip`

The upload API creates the private object path from the same verified user ID. A missing or invalid user produces a clear authentication failure. User IDs are not rendered in the interface.

RLS remains the final enforcement boundary. A caller cannot bypass ownership checks by using the Supabase REST API directly or by constructing an untyped payload.

## Migration order

The table migrations were applied manually in this order:

1. `supabase/migrations/002_create_player_clip_workflow.sql`
2. `supabase/migrations/003_add_player_workflow_rls_policies.sql`

Migration 002 creates the six tables, enables RLS, revokes anonymous access, and deliberately creates no policies. Migration 003 adds the policies below.

Migration 004 is the next review gate and remains unapplied:

3. `supabase/migrations/004_create_private_player_clip_storage.sql`

## Policies added by migration 003

Every policy targets the `authenticated` role. There are no anonymous policies and no unrestricted `USING (true)` or `WITH CHECK (true)` clauses.

| Table | SELECT | INSERT | UPDATE | DELETE |
| --- | --- | --- | --- | --- |
| `players` | `players_select_own` | `players_insert_own` | `players_update_own` | `players_delete_own` |
| `match_sessions` | `match_sessions_select_own` | `match_sessions_insert_own` | `match_sessions_update_own` | `match_sessions_delete_own` |
| `clips` | `clips_select_own` | `clips_insert_own` | `clips_update_own` | `clips_delete_own` |
| `analysis_drafts` | `analysis_drafts_select_own` | `analysis_drafts_insert_own` | `analysis_drafts_update_own` | `analysis_drafts_delete_own` |
| `reports` | `reports_select_own` | `reports_insert_own` | `reports_update_own` | `reports_delete_own` |
| `report_clips` | `report_clips_select_own` | `report_clips_insert_own` | `report_clips_update_own` | `report_clips_delete_own` |

All rows require `created_by = auth.uid()`. INSERT policies apply the condition with `WITH CHECK`; UPDATE policies apply it to both the existing row (`USING`) and resulting row (`WITH CHECK`); DELETE policies use it in `USING`.

## Parent-child ownership enforcement

The policies also validate relational consistency:

- A match session must reference a player owned by the same authenticated user.
- A clip must reference an owned player and an owned match session, and that session must belong to the same player.
- An analysis draft must reference a clip owned by the same user.
- A report must reference an owned player. If it references a match session, the session must be owned by the user and belong to that report's player.
- A report clip must reference an owned report and owned clip for the same player. If the report is match-specific, the clip must be from that match session.
- If a report clip references an analysis draft, the draft must be owned by the same user and belong to that exact clip.

These checks are present for reads, inserts, updates, and deletes. UPDATE `WITH CHECK` clauses prevent changing a foreign key to another user's parent after a valid row has been created.

## Isolation verification

Use a non-production project or reviewed test data.

1. Create pilot users A and B.
2. Sign in as A and create a player, session, clip metadata row, analysis draft, report, and report-clip relation through the application or an A-scoped Supabase client.
3. Record the test row IDs outside the application UI.
4. Sign out, sign in as B, and list each table. No A-owned row should appear.
5. As B, query each known A row ID. SELECT should return no row.
6. As B, try to update and delete an A row. No row should be changed or deleted.
7. As B, try inserts that use A's player, session, clip, analysis draft, or report IDs. PostgreSQL should reject them with an RLS policy violation.
8. As A, verify normal own-row SELECT, INSERT, UPDATE, and DELETE operations work.
9. Inspect the deployed policies after applying the migration:

```sql
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'players',
    'match_sessions',
    'clips',
    'analysis_drafts',
    'reports',
    'report_clips'
  )
order by tablename, policyname;
```

Never test cross-user isolation with a service-role client: service-role access bypasses RLS.

## Sign-in and sign-out test

1. Start the app with the two public Supabase environment values configured.
2. Open `/players` while signed out. Confirm the app redirects to `/sign-in?next=%2Fplayers`.
3. Submit an invalid password. Confirm an inline error is announced and no session is created.
4. Submit a valid pilot account. Confirm the app redirects to `/players` (or the requested protected path).
5. Reload a protected page. Confirm the cookie session remains active.
6. Select **Sign out** in the application navigation. Confirm the session cookies are cleared and `/sign-in` appears.
7. Try a protected page again and confirm it redirects to sign-in.
8. Confirm `/` and `/elite-library` remain available while signed out.

## Next security step: apply reviewed migration 004

Migration 004 creates the private `player-clips` bucket with a 100 MB limit and an allowlist for MP4, MOV, and WebM. Objects use `<authenticated-user-id>/<match-session-id>/<unique-file-name>`. INSERT requires the authenticated Storage owner, user prefix, and an owned match-session folder. SELECT is operation-scoped: upload metadata may be returned for that owned session, while signing a playback URL additionally requires an exact RLS-visible `clips` row. DELETE is owner- and prefix-scoped so failed database persistence can be compensated safely.

Until migration 004 is reviewed and applied, object upload and signed playback remain blocked. Do not expose private paths through public URLs, call `getPublicUrl`, or make the bucket public.
