import { testUsers } from './testUsers';
import { LanguageLevel } from '../../src/entities/hiring.enum';

export const testCandidatesProfiles = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    yearsOfExperience: 5,
    country: 'USA',
    city: 'New York',
    languages: [{ code: 'en', level: LanguageLevel.NATIVE }],
    user: testUsers[5],
  },
];
