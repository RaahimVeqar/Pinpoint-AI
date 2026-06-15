import { PageShell } from "@/components/page-shell";
import { PlaceholderGrid } from "@/components/placeholder-grid";

export default function MatchesPage() {
  return (
    <PageShell
      eyebrow="Match footage"
      title="Matches / Sessions"
      description="A future index for match footage links, session metadata, opponents, surfaces, and dates."
    >
      <PlaceholderGrid
        items={[
          {
            title: "Session list",
            description:
              "Placeholder for recorded matches and practice-set review sessions.",
          },
          {
            title: "Match context",
            description:
              "Placeholder for opponent, score format, court surface, and tournament context.",
          },
          {
            title: "Tagging readiness",
            description:
              "Placeholder for tracking which sessions still need pressure-point tagging.",
          },
        ]}
      />
    </PageShell>
  );
}
