import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export const FIRST_NAME_MAX_LENGTH = 20;
export const LAST_NAME_MAX_LENGTH = 50;
export const PLACE_NAME_MAX_LENGTH = 100;

// A person's name is letters only. Hyphens, apostrophes and single spaces are
// allowed between letters, because 'Anne-Marie', "O'Brien" and 'Van Der Berg'
// are real names. Digits and every other sign are rejected.
export const NAME_PATTERN = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;

// A country or a city follows the same rule, plus a period, so abbreviated
// place names like 'St. Louis' and 'D.C.' pass.
export const PLACE_NAME_PATTERN = /^\p{L}+\.?(?:[ '’.-]\p{L}+\.?)*$/u;

export const IsValidName = (maxLength: number) =>
  applyDecorators(
    IsString(),
    IsNotEmpty(),
    MaxLength(maxLength),
    Matches(NAME_PATTERN, {
      message:
        '$property can contain letters only, without digits or special characters',
    }),
  );

export const IsValidPlaceName = () =>
  applyDecorators(
    IsString(),
    IsNotEmpty(),
    MaxLength(PLACE_NAME_MAX_LENGTH),
    Matches(PLACE_NAME_PATTERN, {
      message:
        '$property can contain letters, spaces, hyphens and periods only, without digits',
    }),
  );
