import { PageShell } from "@/components/page-shell";
import { PlaceholderGrid } from "@/components/placeholder-grid";

export default function EliteLibraryPage() {
  return (
    <PageShell
      eyebrow="Benchmark patterns"
      title="Elite Pressure Library"
      description="A future library of elite pressure-point patterns used as a benchmark for coaching reports."
    >
      <PlaceholderGrid
        items={[
          {
            title: "Serve patterns",
            description:
              "Placeholder for elite serve choices and locations during pressure points.",
          },
          {
            title: "Return patterns",
            description:
              "Placeholder for return depth, target selection, and risk management.",
          },
          {
            title: "Rally patterns",
            description:
              "Placeholder for point construction behaviors under scoreboard stress.",
          },
        ]}
      />
    </PageShell>
  );
}
