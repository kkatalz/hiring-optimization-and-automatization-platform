import { testUsers } from './testUsers';
import { LanguageLevel } from '../../src/entities/hiring.enum';
import { CandidateProfile } from '../../src/entities/candidateProfile';
import { submissionSeeds } from './shared/submissionSeeds';

export const testCandidatesProfiles: CandidateProfile[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    yearsOfExperience: 2,
    country: 'USA',
    city: 'New York',
    languages: [{ code: 'en', level: LanguageLevel.NATIVE }],
    user: testUsers[5],
    submissions: [],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    yearsOfExperience: 7,
    country: 'Ukraine',
    city: 'Kyiv',
    languages: [
      { code: 'ukr', level: LanguageLevel.NATIVE },
      { code: 'en', level: LanguageLevel.C1 },
      { code: 'de', level: LanguageLevel.B1 },
    ],
    user: testUsers[6],
    submissions: [submissionSeeds[0]],
  },
];

export const TOTAL_CANDIDATES = testCandidatesProfiles.length;
