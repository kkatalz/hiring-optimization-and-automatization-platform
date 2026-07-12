export const TimeCommitment = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  PROJECT_BASED: 'PROJECT_BASED',
} as const;

export type TimeCommitment =
  (typeof TimeCommitment)[keyof typeof TimeCommitment];

export const ALL_TIME_COMMITMENTS: TimeCommitment[] = [
  'FULL_TIME',
  'PART_TIME',
  'PROJECT_BASED',
];

export const LanguageLevel = {
  A1: 'A1',
  A2: 'A2',
  B1: 'B1',
  B2: 'B2',
  C1: 'C1',
  C2: 'C2',
  NATIVE: 'NATIVE',
} as const;

export type LanguageLevel = (typeof LanguageLevel)[keyof typeof LanguageLevel];

export const ALL_LANGUAGE_LEVELS: LanguageLevel[] = [
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
  'NATIVE',
];

/** Language levels ordered from weakest to strongest. */
export const LanguageLevelRank: LanguageLevel[] = [...ALL_LANGUAGE_LEVELS];

export interface LanguageProficiency {
  code: string;
  level: LanguageLevel;
}
