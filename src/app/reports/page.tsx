"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { matchSessions, players, pressurePoints, reportSummaries } from "@/lib/mock-data";

export default function ReportsPage() {
  const [selectedReportId, setSelectedReportId] = useState(reportSummaries[0].id);
  const report = reportSummaries.find((item) => item.id === selectedReportId) ?? reportSummaries[0];
  const player = players.find((item) => item.id === report.playerId);
  const session = matchSessions.find((item) => item.id === report.matchSessionId);
  const reportPoints = useMemo(
    () => pressurePoints.filter((point) => point.playerId === report.playerId && point.matchSessionId === report.matchSessionId),
    [report],
  );

  return (
    <PageShell
      eyebrow="Coach-ready output"
      title="Reports"
      description="A focused pressure profile built from saved clip evidence, elite comparison, and the priorities that should shape the next session."
    >
      <div className="reports-layout">
        <aside className="report-browser" aria-label="Available reports">
          <div className="report-browser__head">
            <h2>Player reports</h2>
            <span>{reportSummaries.length} available</span>
          </div>
          <label className="report-browser__select">
            <span className="field-label">Select report</span>
            <select value={selectedReportId} onChange={(event) => setSelectedReportId(event.target.value)} className="field-control">
              {reportSummaries.map((item) => {
                const reportPlayer = players.find((candidate) => candidate.id === item.playerId);
                return <option key={item.id} value={item.id}>{reportPlayer?.name} - {item.createdAt}</option>;
              })}
            </select>
          </label>
          <div className="report-browser__list">
            {reportSummaries.map((item) => {
              const reportPlayer = players.find((candidate) => candidate.id === item.playerId);
              const reportSession = matchSessions.find((candidate) => candidate.id === item.matchSessionId);
              const selected = item.id === report.id;
              return (
                <button key={item.id} type="button" onClick={() => setSelectedReportId(item.id)} aria-pressed={selected} className={selected ? "is-selected" : ""}>
                  <strong>{reportPlayer?.name}</strong>
                  <span>{reportSession?.event}</span>
                  <small>{item.pressurePointsAnalyzed} pressure points · {item.createdAt}</small>
                </button>
              );
            })}
          </div>
        </aside>

        <article className="report-document">
          <header className="report-cover">
            <div className="report-cover__meta">
              <span>Pinpoint AI pressure review</span>
              <span>{report.createdAt}</span>
            </div>
            <div className="report-cover__title">
              <div>
                <p>{player?.name}</p>
                <h2>{report.title}</h2>
                <span>{session?.event} · {session?.surface}</span>
              </div>
              <div className="report-cover__count"><strong className="tabular">{report.pressurePointsAnalyzed}</strong><span>linked points</span></div>
            </div>
            <p className="report-cover__summary">{report.summary}</p>
          </header>

          <section className="report-tendency" aria-labelledby="tendency-heading">
            <div>
              <p>Overall pressure tendency</p>
              <h3 id="tendency-heading">The clearest repeatable signal</h3>
              <p>{report.strengths.join(" ")}</p>
            </div>
            <aside>
              <span>Elite comparison</span>
              <ul>{report.eliteComparisons.map((comparison) => <li key={comparison}>{comparison}</li>)}</ul>
            </aside>
          </section>

          <div className="report-findings">
            <section aria-labelledby="breakdowns-heading">
              <h3 id="breakdowns-heading">Recurring breakdowns</h3>
              <p>Moments where decision clarity or execution became less repeatable.</p>
              <ul>{report.vulnerabilities.map((item) => <li key={item}>{item.replace("Breakdown pattern: ", "")}</li>)}</ul>
            </section>
            <section aria-labelledby="priorities-heading">
              <h3 id="priorities-heading">Coaching priorities</h3>
              <p>High-value interventions to carry into training and match planning.</p>
              <ul>{report.recommendations.map((item) => <li key={item}>{item.replace("Coaching priority: ", "").replace("Next-time adjustment: ", "")}</li>)}</ul>
            </section>
          </div>

          <section className="next-session" aria-labelledby="next-session-heading">
            <div><span>Next-session focus</span><h3 id="next-session-heading">Turn the report into one observable training behavior.</h3></div>
            <p>{report.recommendations[0].replace("Coaching priority: ", "").replace("Next-time adjustment: ", "")}</p>
          </section>

          <section className="report-evidence" aria-labelledby="evidence-heading">
            <div className="report-evidence__head">
              <div><h3 id="evidence-heading">Linked clip evidence</h3><p>The pressure points supporting this report. Open a row for the match context and coaching note.</p></div>
              <span>{reportPoints.length} clips</span>
            </div>
            <div className="report-evidence__list">
              {reportPoints.map((point) => (
                <details key={point.id}>
                  <summary>
                    <div><strong className="tabular">{point.timestamp}</strong><span>{point.scoreContext}</span></div>
                    <div><span>{point.trigger}</span><span className={`status ${point.outcome === "Won" ? "status-success" : "status-danger"}`}>{point.outcome}</span><b aria-hidden="true">+</b></div>
                  </summary>
                  <div className="detail-body report-evidence__detail">
                    <div><span>Observed tendency</span><p>{point.patternObserved}</p></div>
                    <div><span>Coaching priority</span><p>{point.coachNote}</p></div>
                    <dl>
                      <div><dt>Serve / return</dt><dd>{point.server === player?.name ? "Serving" : "Returning"}</dd></div>
                      <div><dt>Rally length</dt><dd>{point.rallyLength} shots</dd></div>
                      <div><dt>Elite anchor</dt><dd>{point.eliteComparisonAnchor ?? "Not assigned"}</dd></div>
                    </dl>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <footer className="report-footer"><span>Pinpoint AI</span><p>Evidence-led pressure analysis for player development.</p></footer>
        </article>
      </div>
    </PageShell>
  );
}
