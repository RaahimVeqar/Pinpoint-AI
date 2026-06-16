import { PageShell } from "@/components/page-shell";
import { elitePressurePatterns } from "@/lib/mock-data";

export default function EliteLibraryPage() {
  return (
    <PageShell
      eyebrow="Benchmark patterns"
      title="Elite Pressure Library"
      description="Curated elite pressure patterns used as comparison anchors for coaching reports."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {elitePressurePatterns.map((pattern) => (
          <article
            key={pattern.id}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-950">
                {pattern.player}
              </h2>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {pattern.trigger}
              </span>
              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {pattern.phase}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-800">
              {pattern.pattern}
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-medium text-slate-500">Tactical theme</dt>
                <dd className="mt-1 text-slate-900">{pattern.tacticalTheme}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">
                  Coaching application
                </dt>
                <dd className="mt-1 leading-6 text-slate-900">
                  {pattern.coachingApplication}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
