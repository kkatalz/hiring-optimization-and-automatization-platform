export enum TimeCommitment {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  PROJECT_BASED = 'project_based',
}

export enum LanguageLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
  NATIVE = 'native',
}

export type LanguageProficiency = {
  code: string;
  level: LanguageLevel;
};
