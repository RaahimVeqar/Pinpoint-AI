import { PageShell } from "@/components/page-shell";
import {
  savedClipAnalyses,
  savedPlayerClips,
  savedPlayerReports,
} from "@/lib/player-clip-data";

export default function MatchesPage() {
  const sessions = Array.from(
    new Set(savedPlayerClips.map((clip) => clip.matchSession)),
  ).map((matchSession) => {
    const clips = savedPlayerClips.filter(
      (clip) => clip.matchSession === matchSession,
    );
    const report = savedPlayerReports.find(
      (item) => item.matchSession === matchSession,
    );

    return {
      matchSession,
      playerName: clips[0]?.playerName ?? "Unknown player",
      clips,
      report,
    };
  });

  const analysisByClipId = new Map(
    savedClipAnalyses.map((analysis) => [analysis.clipId, analysis]),
  );

  return (
    <PageShell
      eyebrow="Saved analyzed clips"
      title="Matches / Sessions"
      description="Review mock saved player clips, clip evidence, analysis status, and report readiness for the stronger MVP workflow."
    >
      <div className="space-y-6">
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm leading-6 text-amber-900">
            Currently using mock saved analyses. Supabase storage will persist
            real clips in the next backend phase.
          </p>
        </section>

        <div className="grid gap-5">
          {sessions.map((session) => (
            <article
              key={session.matchSession}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">
                    {session.playerName}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">
                    {session.matchSession}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {session.clips.length} clips analyzed.{" "}
                    {session.report
                      ? "Ready for report review."
                      : "Ready for report once coach review is complete."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    Analysis saved
                  </span>
                  <span className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                    {session.report ? "Ready for report" : "Reanalyze later"}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                {session.clips.map((clip) => {
                  const analysis = analysisByClipId.get(clip.id);
                  const isLost = clip.playerPointOutcome === "Lost";
                  const needsReview = analysis?.reviewStatus === "Needs Review";

                  return (
                    <details
                      key={clip.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4 open:bg-white"
                    >
                      <summary className="cursor-pointer list-none">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-slate-950">
                              {clip.clipTitle}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">
                              {clip.timestampOrRange} | {clip.scoreContext}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                              {clip.pressureTrigger}
                            </span>
                            <span
                              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                                isLost
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {clip.playerPointOutcome}
                            </span>
                            <span
                              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                                needsReview
                                  ? "bg-amber-50 text-amber-800"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {analysis?.reviewStatus ?? "Draft"}
                            </span>
                          </div>
                        </div>
                      </summary>

                      <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 lg:grid-cols-[280px_1fr]">
                        <dl className="space-y-3 text-sm">
                          <div>
                            <dt className="font-medium text-slate-500">
                              Clip evidence
                            </dt>
                            <dd className="mt-1 text-slate-900">
                              {clip.clipSource}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-slate-500">
                              Pressure trigger
                            </dt>
                            <dd className="mt-1 text-slate-900">
                              {clip.pressureTrigger}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-slate-500">
                              Pressure pattern family
                            </dt>
                            <dd className="mt-1 text-slate-900">
                              {clip.pointPatternFamily}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-slate-500">
                              Reanalysis
                            </dt>
                            <dd className="mt-1 text-slate-900">
                              Reanalyze later
                            </dd>
                          </div>
                        </dl>

                        {analysis && (
                          <div className="grid gap-4 text-sm md:grid-cols-2">
                            <div className="md:col-span-2">
                              <h4 className="font-semibold text-slate-950">
                                Saved analysis details
                              </h4>
                              <p className="mt-1 leading-6 text-slate-700">
                                {analysis.whatHappened}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-slate-500">
                                Where it broke down
                              </p>
                              <p className="mt-1 leading-6 text-slate-900">
                                {analysis.likelyBreakdownMoment}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-slate-500">
                                Elite reference
                              </p>
                              <p className="mt-1 leading-6 text-slate-900">
                                {analysis.eliteReferencePattern}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-slate-500">
                                Next-time adjustment
                              </p>
                              <p className="mt-1 leading-6 text-slate-900">
                                {analysis.nextTimeAdjustment}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-slate-500">
                                Training focus
                              </p>
                              <p className="mt-1 leading-6 text-slate-900">
                                {analysis.trainingFocus}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>

              {session.report && (
                <div className="mt-5 rounded-md bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-950">
                    Saved report snapshot
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {session.report.overallPressureTendency}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-600">
                    Next session focus: {session.report.nextSessionFocus}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
