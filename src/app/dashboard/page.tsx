import { PageShell } from "@/components/page-shell";
import { PlaceholderGrid } from "@/components/placeholder-grid";

export default function DashboardPage() {
  return (
    <PageShell
      eyebrow="Coach workspace"
      title="Dashboard"
      description="A future overview of players, recent sessions, tagged pressure points, and report status."
    >
      <PlaceholderGrid
        items={[
          {
            title: "Recent match sessions",
            description:
              "Placeholder for the latest uploaded or linked match footage sessions.",
          },
          {
            title: "Pressure-point activity",
            description:
              "Placeholder for counts and trends across 30-30, deuce, advantage, and break-point moments.",
          },
          {
            title: "Report pipeline",
            description:
              "Placeholder for draft, reviewed, and exported coaching reports.",
          },
        ]}
      />
    </PageShell>
  );
}
