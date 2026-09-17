// A language is written either as an ISO code ('en', 'ukr') or spelled out
// ('ukrainian', 'Norwegian Bokmal', 'Serbo-Croatian'), so it is letters, with
// spaces, hyphens and apostrophes allowed between them. Digits are rejected.
const LANGUAGE_PATTERN = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;

const LANGUAGE_MAX_LENGTH = 100;

export const LANGUAGE_CODE_HINT =
  'A language is letters only, like en or ukrainian.';

export const isValidLanguageCode = (code: string) => {
  const trimmed = code.trim();

  return (
    trimmed.length <= LANGUAGE_MAX_LENGTH && LANGUAGE_PATTERN.test(trimmed)
  );
};

// Languages are compared as plain strings on the backend, so they are stored
// lowercase and 'English' and 'english' stay one language.
export const normalizeLanguageCode = (code: string) =>
  code.trim().toLowerCase();
