import { PageShell } from "@/components/page-shell";

const schemaGroups = [
  {
    label: "A",
    title: "Human Context",
    description: "Traceable match, score, and source details supplied by the researcher.",
    fields: [
      "ID", "Elite Player", "Opponent", "Match / Tournament", "Year", "Surface",
      "Set Score", "Game Score", "Point Score", "Pressure Trigger", "Timestamp", "Source Link",
    ],
  },
  {
    label: "B",
    title: "AI Observed Analysis",
    description: "Structured observations drafted from what is visible in each pressure-point clip.",
    fields: [
      "Serve or Return", "Point Outcome", "First Serve In", "Rally Length", "Primary Pattern",
      "Aggression Level", "Risk Decision", "Shot That Decided Point", "Error / Winner Type",
      "Reset Behavior", "Body Language Note", "Tactical Principle", "Coaching Takeaway", "Tags",
    ],
  },
  {
    label: "C",
    title: "Human Review",
    description: "Editorial controls that make uncertainty and approval explicit before import.",
    fields: ["Confidence Level", "Review Status", "Reviewer Notes"],
  },
];

const previewRows = [
  {
    id: "ELITE-001", player: "Novak Djokovic", opponent: "Roger Federer",
    trigger: "Match Point", pattern: "Compact deep-middle return", tags: ["return", "deep middle"],
    confidence: "High", status: "Approved",
  },
  {
    id: "ELITE-002", player: "Rafael Nadal", opponent: "Novak Djokovic",
    trigger: "Deuce", pattern: "Heavy crosscourt forehand before line change", tags: ["margin", "direction change"],
    confidence: "Medium", status: "In review",
  },
  {
    id: "ELITE-003", player: "Carlos Alcaraz", opponent: "Novak Djokovic",
    trigger: "Tiebreak", pattern: "Forehand acceleration into forward transition", tags: ["forehand", "transition"],
    confidence: "Low", status: "Needs review",
  },
];

const readinessItems = [
  "20 clips collected",
  "Clip file names match spreadsheet IDs",
  "Source links/timestamps included",
  "AI-observed fields filled",
  "Low-confidence rows reviewed",
  "Tags standardized",
  "Approved rows ready for elite library",
];

const nextSteps = [
  "Clean and standardize field values",
  "Convert the reviewed data to JSON or CSV",
  "Import approved rows into the Elite Library",
  "Store the dataset in Supabase in a later phase",
];

export default function DatasetPage() {
  return (
    <PageShell
      eyebrow="Data preparation"
      title="Elite Dataset Import"
      description="The elite dataset is built from AI-observed pressure-point clips. A spreadsheet or CSV provides the controlled bridge between clip analysis and the reviewed Elite Pressure Library."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="max-w-3xl">
          <h2 className="text-lg font-semibold text-slate-950">Expected dataset schema</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Each row represents one elite pressure-point clip. Human context preserves provenance, AI-observed fields structure the visible play, and human review controls what can enter the library.
          </p>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {schemaGroups.map((group) => (
            <article key={group.title} className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-700 text-sm font-semibold text-white">{group.label}</span>
                <div>
                  <h3 className="font-semibold text-slate-950">{group.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{group.description}</p>
                </div>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.fields.map((field) => <li key={field} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700">{field}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-950">CSV import preview</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Preview how spreadsheet rows will be checked before they enter the Elite Library. The rows below are illustrative only.</p>
          <div aria-disabled="true" className="mt-5 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-7 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-lg text-slate-500" aria-hidden="true">↑</div>
            <p className="mt-3 text-sm font-semibold text-slate-700">Upload CSV</p>
            <p className="mt-1 text-xs text-slate-500">File upload will be enabled after the import pipeline is connected.</p>
            <button type="button" disabled className="mt-4 cursor-not-allowed rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500">Choose file</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>{["ID", "Elite Player", "Opponent", "Pressure Trigger", "Primary Pattern", "Tags", "Confidence Level", "Review Status"].map((heading) => <th key={heading} scope="col" className="whitespace-nowrap px-4 py-3">{heading}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {previewRows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-4 font-mono text-xs font-semibold text-slate-700">{row.id}</td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">{row.player}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">{row.opponent}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">{row.trigger}</td>
                  <td className="min-w-64 px-4 py-4 leading-5 text-slate-700">{row.pattern}</td>
                  <td className="min-w-52 px-4 py-4"><div className="flex flex-wrap gap-1.5">{row.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{tag}</span>)}</div></td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">{row.confidence}</td>
                  <td className="whitespace-nowrap px-4 py-4"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">Previewing 3 mock rows · No file has been uploaded</div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Dataset readiness checklist</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Use these checks before treating the first 20 rows as import-ready.</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {readinessItems.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-md border border-slate-200 p-3 text-sm font-medium text-slate-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-transparent" aria-hidden="true">✓</span>{item}
              </li>
            ))}
          </ul>
        </section>

        <aside className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Next step</p>
          <h2 className="mt-2 text-lg font-semibold text-emerald-950">Prepare the first 20 rows</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-900">Once the clips and spreadsheet are complete, the dataset can move through a controlled import sequence.</p>
          <ol className="mt-4 space-y-3">
            {nextSteps.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-5 text-emerald-950"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-semibold text-white">{index + 1}</span>{step}</li>)}
          </ol>
        </aside>
      </div>
    </PageShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === "Approved"
    ? "bg-emerald-50 text-emerald-700"
    : status === "Needs review"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-600";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}