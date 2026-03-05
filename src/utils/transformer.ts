import { ValueTransformer } from 'typeorm';

export const jsonToStringArrayTransformer: ValueTransformer = {
  to: (value: string | string[]) => value, // saves to DB; store as-is.
  from: (value: unknown) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        /* not JSON — return as-is */
      }
    }
    return value;
  },
};
