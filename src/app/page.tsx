import Link from "next/link";

export default function Home() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <div className="space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Tennis pressure-point analysis
        </p>
        <div className="space-y-4">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Pinpoint AI helps coaches understand what happens when the match is
            on the line.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Analyze pressure-point clips, compare player behavior against elite
            patterns, and turn match moments into actionable coaching insight.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Open dashboard
          </Link>
          <Link
            href="/tagging"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-white"
          >
            View tagging workspace
          </Link>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-4">
          <p className="text-sm font-medium text-slate-500">How Pinpoint works</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            From match moment to coaching insight
          </h2>
        </div>
        <dl className="mt-6 grid gap-4">
          {[
            ["Add clip context", "Provide the score, pressure trigger, and relevant match context"],
            ["Review drafted analysis", "Pinpoint AI identifies tactical patterns and player behavior"],
            ["Compare and coach", "Use elite patterns to shape actionable player development"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-md bg-slate-50 p-4 ring-1 ring-slate-200"
            >
              <dt className="text-sm font-semibold text-slate-950">{label}</dt>
              <dd className="mt-1 text-sm text-slate-600">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
