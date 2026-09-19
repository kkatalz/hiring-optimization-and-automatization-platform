import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength } from 'class-validator';

// A language is written either as an ISO code ('en', 'ukr') or spelled out
// ('ukrainian', 'Norwegian Bokmal', 'Serbo-Croatian'), so it is letters, with
// spaces, hyphens and apostrophes allowed between them. Digits are rejected.
export const LANGUAGE_PATTERN = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;

export const LANGUAGE_MAX_LENGTH = 100;

export const IsValidLanguageCode = () =>
  applyDecorators(
    Transform(({ value }: { value: unknown }) =>
      typeof value === 'string' ? value.trim().toLowerCase() : value,
    ),
    IsString(),
    MaxLength(LANGUAGE_MAX_LENGTH),
    Matches(LANGUAGE_PATTERN, {
      message:
        '$property must be a language written in letters, for example "en" or "ukrainian"',
    }),
  );
