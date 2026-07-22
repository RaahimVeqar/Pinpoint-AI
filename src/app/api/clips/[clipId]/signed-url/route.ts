import { NextResponse } from "next/server";

import { getClipById } from "@/lib/repositories/clips";
import { PlayerClipRepositoryError } from "@/lib/repositories/player-clip-repository";
import {
  requireAuthenticatedSupabaseClient,
  SupabaseAuthenticationError,
} from "@/lib/supabase/authenticated-server";
import {
  ClipStorageError,
  createSignedClipPlaybackUrl,
} from "@/lib/supabase/clip-storage";

type RouteContext = { params: Promise<{ clipId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { supabase } = await requireAuthenticatedSupabaseClient();
    const { clipId } = await context.params;
    const clip = await getClipById(supabase, clipId);

    if (!clip) {
      return NextResponse.json({ error: "Clip not found." }, { status: 404 });
    }

    if (clip.upload_status !== "ready") {
      return NextResponse.json(
        { error: "Clip is not ready for playback." },
        { status: 409 },
      );
    }

    const playback = await createSignedClipPlaybackUrl(
      supabase,
      clip.storage_path,
    );

    return NextResponse.json(
      { clipId: clip.id, ...playback },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof SupabaseAuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof PlayerClipRepositoryError) {
      const status = error.code === "42501" ? 403 : 500;
      return NextResponse.json(
        {
          error:
            status === 403
              ? "Access denied by RLS."
              : "Unable to load the clip.",
        },
        { status },
      );
    }
    if (error instanceof ClipStorageError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Unable to create a signed playback URL." },
      { status: 500 },
    );
  }
}
