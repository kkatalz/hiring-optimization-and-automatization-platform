import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum TimeCommitment {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  PROJECT_BASED = 'PROJECT_BASED',
}

export enum LanguageLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
  NATIVE = 'NATIVE',
}

/**
 * In LanguageProficiency, both `code` and `level` are deliberately optional.
 * Code alone means "this language, any level";
 * Level alone means "any language, at least this level";
 * Matching is strict: for each field that IS set, the target must have that field and satisfy it.
 * BUT: An empty `{}` matches everything.
 *
 * Used in:
 *   - CreateVacancyDto / UpdateVacancyDto `languageRequirements` (a vacancy's requirements)
 *   - VacancyFilterDto `languageRequirements` — matched in VacancyService.fetchVacanciesWithFilters
 *   - CandidateProfileFilterDto / VacancySubmissionFilterDto `languages` — matched in
 *     filterByLanguages / meetsLanguageRequirement and scored in scoreLanguages
 *
 * For candidate's languages (CandidateLanguageProficiency) both fields are required, since a held skill is always fully known.
 */
export class LanguageProficiency {
  /**
   * @example "en"
   */
  @IsOptional()
  @IsString()
  code?: string;

  /**
   * One of A1, A2, B1, B2, C1, C2, NATIVE.
   * @example "B2"
   */
  @IsOptional()
  @IsEnum(LanguageLevel)
  level?: LanguageLevel;
}

export const LanguageLevelRank = [
  LanguageLevel.A1,
  LanguageLevel.A2,
  LanguageLevel.B1,
  LanguageLevel.B2,
  LanguageLevel.C1,
  LanguageLevel.C2,
  LanguageLevel.NATIVE,
];
