"use client";

import { useActionState } from "react";

import { signInAction, type SignInState } from "@/app/auth/actions";

const initialState: SignInState = { error: null };

type SignInFormProps = {
  nextPath: string;
};

export function SignInForm({ nextPath }: SignInFormProps) {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialState,
  );

  return (
    <form action={formAction} className="auth-form">
      <input type="hidden" name="next" value={nextPath} />

      <label>
        <span className="field-label">Email</span>
        <input
          className="field-control"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          autoFocus
        />
      </label>

      <label>
        <span className="field-label">Password</span>
        <input
          className="field-control"
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </label>

      {state.error ? (
        <p className="auth-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button className="button-primary auth-submit" type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <span className="loading-dot" aria-hidden="true" /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>

      <p className="auth-form__note">
        Access is limited to invited Pinpoint AI pilot users.
      </p>
    </form>
  );
}
