import { EliteLibraryClient } from "@/app/elite-library/elite-library-client";
import { getElitePressurePoints } from "@/lib/repositories/elite-pressure-points";

export const dynamic = "force-dynamic";

export default async function EliteLibraryPage() {
  const elitePressurePoints = await getElitePressurePoints();

  return <EliteLibraryClient elitePressurePoints={elitePressurePoints} />;
}
