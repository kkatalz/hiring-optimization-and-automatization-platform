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
