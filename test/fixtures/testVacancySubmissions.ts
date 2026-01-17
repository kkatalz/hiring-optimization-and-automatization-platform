import { VacancySubmissionStatus } from '../../src/entities/status.enum';
import { VacancySubmission } from '../../src/entities/vacancySubmission';
import { testUsers } from '../fixtures/testUsers';

const VACANCY_ID = 'ced1d3f0-fe3e-4b22-9c26-54f2e5ff4b2e';
export let testVacancySubmissions: VacancySubmission[] = [];

const VACANCY = {
  id: '1bf26415-b5d1-407d-a040-69b78c7bc268',
  name: 'Zoo keeper helper 1',
  description: '',
  salary: '500-700 USD',
  tenantId: 'df0787ee-3bd2-49bd-a0aa-de97b112e3b6',
  createdById: '90e39f71-7f21-4911-81a9-10bbeafe33b7',
  submissions: [testVacancySubmissions[0]],
};

testVacancySubmissions = [
  {
    id: '0899dc13-fab7-4041-b99c-9865925588f9',
    comment: 'I want to work!',
    vacancyId: VACANCY_ID,
    candidateId: testUsers[5].id,
    status: VacancySubmissionStatus.pending,
    vacancy: VACANCY,
    candidate: testUsers[5],
  },
];

export const EXPECTED_VACANCY_SUBMISSIONS_NUM = testVacancySubmissions.length;
