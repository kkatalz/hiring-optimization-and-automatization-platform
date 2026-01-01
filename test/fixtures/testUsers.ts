import { testTenants } from '../fixtures/testTenants';
import { UserRole } from '../../src/entities/role.enum';
import { User } from '../../src/entities/user';

export const testUsers: User[] = [
  {
    id: '90e39f71-7f21-4911-81a9-10bbeafe33b7',
    email: 'test@dot.com',
    password: '$2a$10$hZ2NZ8uuZfIzLPOhE9tBMOswqcYVoZqRYqIuj643t3baX0nAGemb2',
    firstName: 'Admin_0',
    lastName: 'Admin_0',
    deleted: false,
    role: UserRole.admin,
    tenantId: testTenants[0].id,
  },
  {
    id: 'a5d63fea-a207-42d3-9ae8-cc95bbbf3be1',
    email: 'test1@dot.com',
    password: '$2a$10$7TWxkB5ZBRtj8WmpqhJBUeysQKkuNaxIC0MjM/wOeRK.F08gHjBva',
    firstName: 'Recruiter_1',
    lastName: 'Recruiter_1',
    deleted: false,
    role: UserRole.recruiter,
    tenantId: testTenants[0].id,
  },
  {
    id: '82361886-55aa-4d4b-a86f-c8841e9311c4',
    email: 'test2@dot.com',
    password: '$2a$10$7TWxkB5ZBRtj8WmpqhJBUeysQKkuNaxIC0MjM/wOeRK.F08gHjBva',
    firstName: 'Recruiter_2',
    lastName: 'Recruiter_2',
    deleted: true,
    role: UserRole.recruiter,
    tenantId: testTenants[0].id,
  },
  {
    id: 'b00cde85-e4ed-45ca-a8bd-26e67f46e2c7',
    email: 'test3@dot.com',
    password: '$2a$10$7TWxkB5ZBRtj8WmpqhJBUeysQKkuNaxIC0MjM/wOeRK.F08gHjBva',
    firstName: 'Recruiter_3',
    lastName: 'Recruiter_3',
    deleted: false,
    role: UserRole.recruiter,
    tenantId: testTenants[1].id,
  },
];

export const EXPECTED_ACTIVE_USERS = testUsers.filter((user) => !user.deleted);

export const EXPECTED_ACTIVE_USERS_NUM = testUsers.filter(
  (user) => !user.deleted,
).length;

export const TOTAL_USERS = testUsers.length;
