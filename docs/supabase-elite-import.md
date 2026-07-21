# Supabase Elite Pressure Point Import

Supabase CSV import is manual for this integration step. The database stores point metadata only; do not upload video files into this table.

## Apply the migration

1. Open the Pinpoint AI project in the Supabase dashboard.
2. Open **SQL Editor** and create a new query.
3. Copy the full contents of `supabase/migrations/001_create_elite_pressure_points.sql` into the query.
4. Run the query and confirm that it completes successfully.
## Import the reviewed dataset

1. Open **Table Editor**.
2. Select `public.elite_pressure_points`.
3. Choose **Insert** and then **Import data from CSV**.
4. Select `data/elite-pressure-points.csv` from this repository.
5. Confirm that the CSV columns map to the table columns, then complete the import.
6. Verify that the table contains exactly 20 rows.
7. Confirm every row has `review_status` set to `Reviewed` and `approved_for_library` set to `true`.

`clip_file_name` is reference metadata only. Do not upload video files into `elite_pressure_points`; video storage will be designed separately in a later step.

## Verify access controls

1. In **Table Editor**, select `elite_pressure_points` and confirm that RLS is enabled.
2. Open **SQL Editor**, create a new query, and run the following policy inspection:

```sql
select policyname, roles, cmd, qual
from pg_policies
where schemaname = 'public'
  and tablename = 'elite_pressure_points';
```

3. Confirm it returns exactly one `SELECT` policy for `{anon,authenticated}` and that its `qual` requires both `approved_for_library = true` and `review_status = 'Reviewed'`.
4. Run the following privilege inspection:

```sql
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'elite_pressure_points'
  and grantee in ('anon', 'authenticated')
order by grantee, privilege_type;
```

5. Confirm `anon` and `authenticated` have `SELECT` only, with no `INSERT`, `UPDATE`, `DELETE`, or other write privileges.
6. Test the RLS-filtered anonymous read in **SQL Editor**:

```sql
begin;
set local role anon;

select
  count(*) as visible_rows,
  count(*) filter (
    where approved_for_library = true
      and review_status = 'Reviewed'
  ) as reviewed_and_approved_rows
from public.elite_pressure_points;

rollback;
```

7. Confirm both counts are `20`. This proves the anonymous role can read the imported reviewed/approved rows through the SELECT policy. Rows that fail either condition are hidden by RLS.
8. Confirm the policy inspection contains no anonymous or authenticated `INSERT`, `UPDATE`, or `DELETE` policies. The privilege inspection should also show that those roles have no table-level write privileges.

The application uses the public publishable key and is subject to RLS. Do not add a service-role key for this integration.
