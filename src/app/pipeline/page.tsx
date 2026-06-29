import { PageShell } from "@/components/page-shell";

const pipelineSteps = [
  {
    title: "Clip Context",
    description:
      "The coach supplies only the essential context: player, match or session, score context when known, pressure trigger, clip range, and an optional note.",
  },
  {
    title: "Frame Sampling",
    description:
      "The system prepares representative frames from the pressure-point clip so the moment can be reviewed consistently.",
  },
  {
    title: "VLM Observation",
    description:
      "A vision-language model observes the clip and identifies visible details such as shot sequence, court position, tempo, body language, and point outcome.",
  },
  {
    title: "Structured Analysis",
    description:
      "An LLM turns the observation into a draft analysis with fields coaches can review, edit, approve, and reuse.",
  },
  {
    title: "Elite Dataset Import",
    description:
      "AI-observed elite clips are cleaned, standardized, and reviewed as a structured dataset before approved rows enter the comparison library.",
  },
  {
    title: "Elite Library Comparison",
    description:
      "The draft is compared against the elite pressure library to surface relevant benchmark patterns and coaching anchors.",
  },
  {
    title: "Coach Review",
    description:
      "The coach validates the AI draft, refines any uncertain fields, and decides whether the analysis is ready for the player record.",
  },
  {
    title: "Report",
    description:
      "Approved analysis can be added to a report so pressure-point themes become clear, traceable development guidance.",
  },
];

export default function PipelinePage() {
  return (
    <PageShell
      eyebrow="Product architecture"
      title="AI Pipeline"
      description="Pinpoint AI is designed around an AI Draft Analysis workflow. Coaches provide lightweight clip context, and the system drafts structured pressure-point insight for review."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            MVP Analysis Flow
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            The MVP is not a manual tagging tool. It is a coach-reviewed AI
            draft system that moves from clip context to structured analysis,
            then compares the result with elite pressure examples.
          </p>

          <ol className="mt-6 space-y-4">
            {pipelineSteps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-700 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div className="min-w-0 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                  <h3 className="font-semibold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">
              Coach Role
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The coach does not build the analysis field by field. The coach
              supplies context, reviews the AI draft, resolves uncertainty, and
              approves the final record.
            </p>
          </section>

          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            <h2 className="text-base font-semibold text-emerald-950">
              Current Prototype Boundary
            </h2>
            <p className="mt-2 text-sm leading-6 text-emerald-900">
              This frontend version demonstrates the product workflow only. No
              OpenAI integration, real video upload, Supabase storage,
              authentication, or production inference is connected.
            </p>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
