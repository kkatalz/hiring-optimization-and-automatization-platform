import { LanguageLevel, TimeCommitment } from '../../src/entities/hiring.enum';
import { Vacancy } from '../../src/entities/vacancy';
import { testTenants } from './testTenants';
import { testUsers } from './testUsers';
import { submissionSeeds } from './shared/submissionSeeds';

const VACANCY_1_ID = 'ced1d3f0-fe3e-4b22-9c26-54f2e5ff4b2e';
const VACANCY_2_ID = '1bf26415-b5d1-407d-a040-69b78c7bc268';
const VACANCY_3_ID = 'aaa11111-1111-1111-1111-111111111111';
const VACANCY_4_ID = 'bbb22222-2222-2222-2222-222222222222';

export const testVacancies: Vacancy[] = [
  {
    id: VACANCY_1_ID,
    name: 'Zoo keeper',
    description: '',
    minSalary: 1000,
    maxSalary: 1100,
    tenantId: testTenants[0].id,
    createdById: testUsers[0].id,
    needsReclustering: false,
    createdAt: new Date('2025-01-01'),
  },

  {
    id: VACANCY_2_ID,
    name: 'Zoo keeper helper 1',
    description: '',
    minSalary: 500,
    maxSalary: 700,
    tenantId: testTenants[0].id,
    createdById: testUsers[0].id,
    needsReclustering: false,
    submissions: [submissionSeeds[0]],
    timeCommitment: TimeCommitment.FULL_TIME,
    createdAt: new Date('2025-02-01'),
  },

  {
    id: VACANCY_3_ID,
    name: 'Frontend Developer',
    description: 'React/TypeScript position',
    minSalary: 3000,
    maxSalary: 5000,
    tenantId: testTenants[0].id,
    createdById: testUsers[0].id,
    needsReclustering: false,
    timeCommitment: TimeCommitment.PART_TIME,
    tags: ['React', 'TypeScript', 'Frontend'],
    requiredYearsOfExperience: 3,
    languageRequirements: [
      { code: 'en', level: LanguageLevel.B2 },
      { code: 'uk', level: LanguageLevel.C1 },
    ],
    createdAt: new Date('2025-03-01'),
  },

  {
    id: VACANCY_4_ID,
    name: 'Backend Engineer',
    description: 'Node.js microservices',
    minSalary: null,
    maxSalary: null,
    tenantId: testTenants[0].id,
    createdById: testUsers[0].id,
    needsReclustering: false,
    timeCommitment: TimeCommitment.PROJECT_BASED,
    tags: ['Node.js', 'TypeScript', 'Backend'],
    requiredYearsOfExperience: 5,
    languageRequirements: [{ code: 'en', level: LanguageLevel.C1 }],
    createdAt: new Date('2025-04-01'),
  },
];

export const EXPECTED__VACANCIES_NUM = testVacancies.length;
export const EXPECTED__VACANCIES_WITH_SUBM_NUM = testVacancies.filter(
  (vacancy) => vacancy.submissions,
).length;
