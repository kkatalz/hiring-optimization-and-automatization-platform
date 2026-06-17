import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
): string {
  if (!error) return 'Unknown error';

  if ('status' in error) {
    if (typeof error.status === 'number') {
      const body = error.data as { message?: string };
      return body?.message ?? `Request failed (${error.status})`;
    }
    return error.error;
  }

  return error.message ?? 'Unknown error'; 
}
