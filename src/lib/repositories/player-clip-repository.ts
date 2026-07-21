import "server-only";

export type SupabaseFailure = {
  code?: string;
  details?: string;
  hint?: string;
  message: string;
};

export class PlayerClipRepositoryError extends Error {
  readonly code?: string;
  readonly details?: string;
  readonly hint?: string;

  constructor(operation: string, failure: SupabaseFailure) {
    super(`${operation}: ${failure.message}`);
    this.name = "PlayerClipRepositoryError";
    this.code = failure.code;
    this.details = failure.details;
    this.hint = failure.hint;
  }
}

export function requireRepositoryData<T>(
  data: T | null,
  failure: SupabaseFailure | null,
  operation: string,
): T {
  if (failure) {
    throw new PlayerClipRepositoryError(operation, failure);
  }

  if (data === null) {
    throw new PlayerClipRepositoryError(operation, {
      message: "Supabase returned no data.",
    });
  }

  return data;
}

export function throwIfRepositoryFailure(
  failure: SupabaseFailure | null,
  operation: string,
): void {
  if (failure) {
    throw new PlayerClipRepositoryError(operation, failure);
  }
}
