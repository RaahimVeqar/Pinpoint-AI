import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import {
  savedClipAnalyses,
  savedPlayerClips,
  savedPlayerReports,
} from "@/lib/player-clip-data";

export default function MatchesPage() {
  const sessions = Array.from(new Set(savedPlayerClips.map((clip) => clip.matchSession))).map((matchSession) => {
    const clips = savedPlayerClips.filter((clip) => clip.matchSession === matchSession);
    const report = savedPlayerReports.find((item) => item.matchSession === matchSession);
    return { matchSession, playerName: clips[0]?.playerName ?? "Unknown player", clips, report };
  });

  const analysisByClipId = new Map(savedClipAnalyses.map((analysis) => [analysis.clipId, analysis]));
  const reviewedClips = savedClipAnalyses.filter((analysis) => analysis.reviewStatus !== "Needs Review").length;

  return (
    <PageShell
      eyebrow="Analyzed clip evidence"
      title="Matches / Saved Clips"
      description="A review library organized around players and sessions, with the analysis state and report readiness visible before opening a clip."
    >
      <div className="library-summary" aria-label="Saved clip library summary">
        <div><strong className="tabular">{sessions.length}</strong><span>match / training sessions</span></div>
        <div><strong className="tabular">{savedPlayerClips.length}</strong><span>saved clip moments</span></div>
        <div><strong className="tabular">{reviewedClips}</strong><span>coach-reviewed analyses</span></div>
        <Link href="/tagging" className="button-primary">Analyze another clip <span aria-hidden="true">→</span></Link>
      </div>

      <p className="notice">Prototype library data is shown here. The Supabase persistence layer is intentionally unchanged in this visual refinement.</p>

      <div className="match-library">
        {sessions.map((session) => (
          <article key={session.matchSession} className="surface match-session">
            <header className="match-session__header">
              <div>
                <p>{session.playerName}</p>
                <h2>{session.matchSession}</h2>
                <span>{session.clips.length} analyzed clip{session.clips.length === 1 ? "" : "s"}</span>
              </div>
              <div className="match-session__readiness">
                <span className="status status-success">Analysis saved</span>
                <span className={`status ${session.report ? "status-success" : "status-warning"}`}>
                  {session.report ? "Report ready" : "Review pending"}
                </span>
              </div>
            </header>

            <div className="clip-list">
              {session.clips.map((clip) => {
                const analysis = analysisByClipId.get(clip.id);
                const needsReview = analysis?.reviewStatus === "Needs Review";
                return (
                  <details key={clip.id} className="clip-row">
                    <summary>
                      <div className="clip-row__identity">
                        <span className="clip-row__time tabular">{clip.timestampOrRange}</span>
                        <div>
                          <h3>{clip.clipTitle}</h3>
                          <p>{clip.scoreContext}</p>
                        </div>
                      </div>
                      <div className="clip-row__signals">
                        <span>{clip.pointPatternFamily}</span>
                        <span className={`status ${clip.playerPointOutcome === "Won" ? "status-success" : "status-danger"}`}>{clip.playerPointOutcome}</span>
                        <span className={`status ${needsReview ? "status-warning" : "status-success"}`}>{analysis?.reviewStatus ?? "Draft"}</span>
                        <b aria-hidden="true">+</b>
                      </div>
                    </summary>

                    <div className="detail-body clip-detail">
                      <dl className="clip-detail__context">
                        <div><dt>Player</dt><dd>{clip.playerName}</dd></div>
                        <div><dt>Pressure trigger</dt><dd>{clip.pressureTrigger}</dd></div>
                        <div><dt>Point outcome</dt><dd>{clip.playerPointOutcome}</dd></div>
                        <div><dt>Saved evidence</dt><dd>{clip.clipSource}</dd></div>
                      </dl>

                      {analysis ? (
                        <div className="clip-detail__analysis">
                          <div className="clip-detail__lead"><h4>What happened</h4><p>{analysis.whatHappened}</p></div>
                          <div><h4>Breakdown moment</h4><p>{analysis.likelyBreakdownMoment}</p></div>
                          <div><h4>Elite comparison</h4><p>{analysis.eliteComparison}</p></div>
                          <div><h4>Next-time adjustment</h4><p>{analysis.nextTimeAdjustment}</p></div>
                          <div><h4>Training focus</h4><p>{analysis.trainingFocus}</p></div>
                        </div>
                      ) : (
                        <p className="notice">No saved analysis is linked to this clip yet.</p>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>

            {session.report && (
              <footer className="match-session__report">
                <div><span>Report snapshot</span><p>{session.report.overallPressureTendency}</p><strong>Next session: {session.report.nextSessionFocus}</strong></div>
                <Link href="/reports" className="button-secondary">Open report</Link>
              </footer>
            )}
          </article>
        ))}
      </div>
    </PageShell>
  );
}
