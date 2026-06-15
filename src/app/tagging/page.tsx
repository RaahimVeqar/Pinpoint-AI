import { PageShell } from "@/components/page-shell";
import { PlaceholderGrid } from "@/components/placeholder-grid";

export default function TaggingPage() {
  return (
    <PageShell
      eyebrow="Manual analysis"
      title="Pressure Point Tagging"
      description="A future workspace for coaches to identify high-pressure points and enter structured point details."
    >
      <PlaceholderGrid
        items={[
          {
            title: "Pressure trigger",
            description:
              "Placeholder for selecting 30-30, deuce, advantage, break point, set point, match point, or tiebreak point.",
          },
          {
            title: "Point details",
            description:
              "Placeholder for serve, return, rally length, shot pattern, outcome, and coach notes.",
          },
          {
            title: "Video reference",
            description:
              "Placeholder for later linking each tag to a timestamp in the source footage.",
          },
        ]}
      />
    </PageShell>
  );
}
