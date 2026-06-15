import { PageShell } from "@/components/page-shell";
import { PlaceholderGrid } from "@/components/placeholder-grid";

export default function PlayersPage() {
  return (
    <PageShell
      eyebrow="Roster"
      title="Players"
      description="A future place to manage player profiles, playing style notes, and pressure-performance history."
    >
      <PlaceholderGrid
        items={[
          {
            title: "Player profiles",
            description:
              "Placeholder for names, handedness, level, and coaching notes.",
          },
          {
            title: "Pressure tendencies",
            description:
              "Placeholder for recurring behaviors during high-leverage points.",
          },
          {
            title: "Development priorities",
            description:
              "Placeholder for coach-defined focus areas tied to match pressure.",
          },
        ]}
      />
    </PageShell>
  );
}
