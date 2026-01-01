import { Vacancy } from '../../src/entities/vacancy';
import { testTenants } from '../fixtures/testTenants';
import { testUsers } from '../fixtures/testUsers';

const VACANCY_ID = 'ced1d3f0-fe3e-4b22-9c26-54f2e5ff4b2e';

const VACANCY_SUBMISSION = {
  id: '0899dc13-fab7-4041-b99c-9865925588f9',
  comment: 'I want to work!',
  vacancyId: VACANCY_ID,
  candidateId: testUsers[5].id,
};

export const testVacancies: Vacancy[] = [
  {
    id: VACANCY_ID,
    name: 'Zoo keeper',
    description: '',
    salary: '1000-1100 USD',
    tenantId: testTenants[0].id,
    createdById: testUsers[0].id,
    submissions: [VACANCY_SUBMISSION],
  },
];

export const EXPECTED__VACANCIES_NUM = testVacancies.length;
