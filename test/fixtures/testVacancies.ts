import { LanguageLevel, TimeCommitment } from '../../src/entities/hiring.enum';
import { Vacancy } from '../../src/entities/vacancy';
import { testTenants } from './testTenants';
import { testUsers } from './testUsers';
import { testVacancySubmissions } from './testVacancySubmissions';

const VACANCY_1_ID = 'ced1d3f0-fe3e-4b22-9c26-54f2e5ff4b2e';
const VACANCY_2_ID = '1bf26415-b5d1-407d-a040-69b78c7bc268';

export const testVacancies: Vacancy[] = [
  {
    id: VACANCY_1_ID,
    name: 'Zoo keeper',
    description: '',
    salary: '1000-1100 USD',
    tenantId: testTenants[0].id,
    createdById: testUsers[0].id,
  },

  {
    id: VACANCY_2_ID,
    name: 'Zoo keeper helper 1',
    description: '',
    salary: '500-700 USD',
    tenantId: testTenants[0].id,
    createdById: testUsers[0].id,
    submissions: [testVacancySubmissions[0]],
    timeCommitment: TimeCommitment.FULL_TIME,
    languageRequirements: [
      { code: 'en', level: LanguageLevel.B2 },
      { code: 'de', level: LanguageLevel.A1 },
    ],
  },
];

export const EXPECTED__VACANCIES_NUM = testVacancies.length;
export const EXPECTED__VACANCIES_WITH_SUBM_NUM = testVacancies.filter(
  (vacancy) => vacancy.submissions,
).length;
