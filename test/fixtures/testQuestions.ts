import { QuestionType } from '../../src/entities/question.enum';
import { Question } from '../../src/entities/question';
import { testTenants } from './testTenants';

export const testQuestions: Question[] = [
  {
    id: 'a0000000-aaaa-aaaa-aaaa-000000000001',
    tenantId: testTenants[0].id,
    label: 'Do you have a car?',
    type: QuestionType.boolean,
    answerOptions: undefined,
    vacancyQuestions: [],
    answers: [],
  },
  {
    id: 'a0000000-aaaa-aaaa-aaaa-000000000002',
    tenantId: testTenants[0].id,
    label: 'What is your biggest strength?',
    type: QuestionType.text,
    answerOptions: undefined,
    vacancyQuestions: [],
    answers: [],
  },
  {
    id: 'a0000000-aaaa-aaaa-aaaa-000000000003',
    tenantId: testTenants[0].id,
    label: 'What is your education level?',
    type: QuestionType.dropdown,
    answerOptions: ['High School', 'Bachelor', 'Master', 'PhD'],
    vacancyQuestions: [],
    answers: [],
  },
  // Belongs to a different tenant — used to test cross-tenant isolation
  {
    id: 'a0000000-aaaa-aaaa-aaaa-000000000004',
    tenantId: testTenants[1].id,
    label: 'Are you available for remote work?',
    type: QuestionType.boolean,
    answerOptions: undefined,
    vacancyQuestions: [],
    answers: [],
  },
];

export const EXPECTED_QUESTIONS_NUM = testQuestions.length;
export const EXPECTED_TENANT_0_QUESTIONS_NUM = testQuestions.filter(
  (q) => q.tenantId === testTenants[0].id,
).length;
