import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export class SupabaseAuthenticationError extends Error {
  constructor(message = "You must be signed in to continue.") {
    super(message);
    this.name = "SupabaseAuthenticationError";
  }
}

export type AuthenticatedSupabaseContext = {
  supabase: SupabaseClient;
  user: User;
};

export async function createAuthenticatedServerClient(): Promise<SupabaseClient> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. The proxy refreshes them.
        }
      },
    },
  });
}

export async function getAuthenticatedUser(
  supabase?: SupabaseClient,
): Promise<User | null> {
  const client = supabase ?? (await createAuthenticatedServerClient());
  const { data, error } = await client.auth.getUser();

  if (error || !data.user) return null;
  return data.user;
}

export async function getAuthenticatedUserId(
  supabase?: SupabaseClient,
): Promise<string> {
  const user = await getAuthenticatedUser(supabase);
  if (!user) throw new SupabaseAuthenticationError();
  return user.id;
}

export async function requireAuthenticatedUser(
  supabase?: SupabaseClient,
): Promise<AuthenticatedSupabaseContext> {
  const client = supabase ?? (await createAuthenticatedServerClient());
  const user = await getAuthenticatedUser(client);

  if (!user) throw new SupabaseAuthenticationError();
  return { supabase: client, user };
}

export async function requireAuthenticatedSupabaseClient(): Promise<AuthenticatedSupabaseContext> {
  return requireAuthenticatedUser();
}
