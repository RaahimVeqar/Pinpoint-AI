import "server-only";

import {
  createClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";

export class SupabaseAuthenticationError extends Error {
  constructor(message = "A valid Supabase access token is required.") {
    super(message);
    this.name = "SupabaseAuthenticationError";
  }
}

export type AuthenticatedSupabaseContext = {
  supabase: SupabaseClient;
  user: User;
};

export async function requireAuthenticatedSupabaseClient(
  request: Request,
): Promise<AuthenticatedSupabaseContext> {
  const accessToken = readBearerToken(request.headers.get("authorization"));
  const supabase = createUserScopedSupabaseClient(accessToken);
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new SupabaseAuthenticationError();
  }

  return { supabase, user: data.user };
}

function createUserScopedSupabaseClient(accessToken: string): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return createClient(supabaseUrl, publishableKey, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

function readBearerToken(authorization: string | null): string {
  const match = authorization?.match(/^Bearer\s+([^\s]+)$/i);
  if (!match) throw new SupabaseAuthenticationError();
  return match[1];
}
