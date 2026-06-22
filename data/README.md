# Elite Pressure-Point Dataset

Each row in `elite-pressure-points-template.csv` represents one elite pressure point.

## Collection rules

- Record observable behavior only. Do not infer intent, emotion, or strategy beyond what the source supports.
- Enter `Unknown` for any uncertain or unavailable field instead of guessing.
- Set `Confidence Level` to `High`, `Medium`, or `Low`.
- Enter tags as comma-separated values within the `Tags` field.
- Do not add copyrighted video files to this repository.
- Set `Source Link` to the public source URL or an approved internal reference.
- Keep sample rows clearly marked as sample/mock data and replace them when preparing a real import.

The CSV can later be imported into Supabase or converted to JSON when the application gains a persistent data layer.
