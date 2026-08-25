import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Extracts a human-readable message from an axios error, preferring the
 * backend's response body ({ message }). NestJS validation errors send
 * `message` as a string[] — those are joined. Falls back to the axios/network
 * message, then to a generic fallback. Use this for thunks that call axios
 * (e.g. auth); use getErrorMessage() for RTK Query errors.
 */
export function getAxiosErrorMessage(
  error: unknown,
  fallback = 'Something went wrong',
): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as
      | { message?: string | string[] }
      | undefined;

    if (body?.message) {
      return Array.isArray(body.message)
        ? body.message.join(', ')
        : body.message;
    }

    return error.message;
  }
  return fallback;
}

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
