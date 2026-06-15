import { PageShell } from "@/components/page-shell";
import { PlaceholderGrid } from "@/components/placeholder-grid";

export default function ReportsPage() {
  return (
    <PageShell
      eyebrow="Coaching output"
      title="Reports"
      description="A future area for AI-assisted coaching reports comparing tagged behavior against elite pressure patterns."
    >
      <PlaceholderGrid
        items={[
          {
            title: "Draft reports",
            description:
              "Placeholder for report generation status and coach review steps.",
          },
          {
            title: "Behavioral summary",
            description:
              "Placeholder for pressure-point strengths, vulnerabilities, and tactical themes.",
          },
          {
            title: "Coaching recommendations",
            description:
              "Placeholder for practice priorities and match-plan adjustments.",
          },
        ]}
      />
    </PageShell>
  );
}
