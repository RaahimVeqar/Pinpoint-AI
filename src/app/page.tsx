import Link from "next/link";

const workflow = [
  {
    title: "Frame the pressure moment",
    copy: "Add the score, trigger, player outcome, and the context a coach can see beyond the clip.",
  },
  {
    title: "Review the AI draft",
    copy: "Turn the point into a structured explanation of what happened and where the decision changed.",
  },
  {
    title: "Coach the next response",
    copy: "Compare the pattern with elite evidence, approve the insight, and carry it into the next session.",
  },
];

const outcomes = [
  ["Elite comparison", "See how the same pressure family is managed in reviewed elite examples."],
  ["Coaching feedback", "Translate a lost or won point into one clear, constructive adjustment."],
  ["Saved reports", "Build a credible player narrative from linked clip evidence over time."],
];

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__court" aria-hidden="true">
          <span className="home-hero__court-net" />
          <span className="home-hero__court-center" />
          <span className="home-hero__court-singles home-hero__court-singles--near" />
          <span className="home-hero__court-singles home-hero__court-singles--far" />
          <span className="home-hero__court-service home-hero__court-service--near" />
          <span className="home-hero__court-service home-hero__court-service--far" />
          <svg
            className="home-hero__shot-path"
            viewBox="0 0 780 360"
            preserveAspectRatio="none"
          >
            <path d="M 74 268 C 186 253 238 110 354 126 S 558 278 704 88" />
            <circle cx="74" cy="268" r="6" />
            <circle cx="354" cy="126" r="6" />
            <circle cx="704" cy="88" r="6" />
          </svg>
          <span className="home-hero__court-reading home-hero__court-reading--path">
            Shot path 03
          </span>
          <span className="home-hero__court-reading home-hero__court-reading--decision">
            Decision zone
          </span>
        </div>

        <div className="home-hero__copy">
          <p className="home-hero__category">AI-assisted tennis pressure analysis</p>
          <h1>Analyzing the moments that decide outcomes.</h1>
          <p className="home-hero__lead">
            Pinpoint AI helps coaches and academies understand how players make
            decisions under pressure—then turns the evidence into a clearer
            plan for the next point and the next session.
          </p>
          <div className="home-hero__actions">
            <Link href="/tagging" className="button-primary">
              Analyze a clip
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/elite-library" className="button-secondary">
              Explore elite patterns
            </Link>
          </div>
          <p className="home-hero__note">
            Built for serious review by coaches, players, and performance teams.
          </p>
        </div>

        <div className="pressure-board" aria-label="Example pressure analysis">
          <div className="pressure-board__header">
            <div>
              <p>Pressure point review</p>
              <h2>Break point · deciding set</h2>
            </div>
            <span className="status status-warning">Coach review</span>
          </div>
          <div className="pressure-board__moment">
            <p>Breakdown moment</p>
            <strong>The direction changed before court position was secured.</strong>
          </div>
          <dl className="pressure-board__readout">
            <div>
              <dt>Elite reference</dt>
              <dd>Build neutral depth before redirection</dd>
            </div>
            <div>
              <dt>Next-time adjustment</dt>
              <dd>Hold crosscourt until balance and depth open the line</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="home-workflow" aria-labelledby="workflow-heading">
        <div className="home-section-intro">
          <h2 id="workflow-heading">From one match moment to a coaching decision</h2>
          <p>
            Pressure analysis matters when it explains the decision—not merely
            the result. Pinpoint connects the clip, the pattern, and the next
            action in one review path.
          </p>
        </div>
        <ol className="workflow-list">
          {workflow.map((step, index) => (
            <li key={step.title}>
              <span className="workflow-list__number">{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-outcomes" aria-labelledby="outcomes-heading">
        <div className="home-outcomes__statement">
          <p>The value of pressure analysis</p>
          <h2 id="outcomes-heading">
            A point ends in seconds. The right evidence keeps working.
          </h2>
        </div>
        <dl className="outcome-list">
          {outcomes.map(([title, copy]) => (
            <div key={title}>
              <dt>{title}</dt>
              <dd>{copy}</dd>
            </div>
          ))}
        </dl>
        <Link href="/reports" className="home-outcomes__link">
          See the coach-ready report output <span aria-hidden="true">→</span>
        </Link>
      </section>
    </div>
  );
}
