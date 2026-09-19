import { ValueTransformer } from 'typeorm';

const toText = (value: unknown): string =>
  typeof value === 'string' ? value : JSON.stringify(value);

const coerce = (value: unknown): string | string[] =>
  Array.isArray(value) ? value.map(toText) : toText(value);

export const jsonToStringArrayTransformer: ValueTransformer = {
  to: (value: unknown) =>
    value === null || value === undefined ? value : coerce(value),

  from: (value: unknown) => {
    if (value === null || value === undefined) return value;

    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.map(toText);
      } catch {
        /* not JSON - it is already the plain string we want */
      }
      return value;
    }

    return coerce(value);
  },
};
