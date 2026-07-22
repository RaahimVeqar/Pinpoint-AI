"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createAuthenticatedServerClient } from "@/lib/supabase/authenticated-server";

export type SignInState = {
  error: string | null;
};

export async function signInAction(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const destination = sanitizeNextPath(formData.get("next"));

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Enter your email and password." };
  }

  const normalizedEmail = email.trim();
  if (!normalizedEmail || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createAuthenticatedServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    return { error: "The email or password is incorrect." };
  }

  revalidatePath("/", "layout");
  redirect(destination);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createAuthenticatedServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/sign-in");
}

function sanitizeNextPath(value: FormDataEntryValue | null): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/players";
  }

  return value;
}
