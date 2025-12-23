import { testTenants } from '../fixtures/testTenants';
import { UserRole } from '../../src/entities/role.enum';
import { User } from '../../src/entities/user';

export const testUsers: User[] = [
  {
    id: '90e39f71-7f21-4911-81a9-10bbeafe33b7',
    email: 'test@dot.com',
    password: '$2a$10$hZ2NZ8uuZfIzLPOhE9tBMOswqcYVoZqRYqIuj643t3baX0nAGemb2',
    firstName: 'John',
    lastName: 'Doe',
    deleted: false,
    role: UserRole.admin,
    tenantId: testTenants[0].id,
  },
  {
    id: '82361886-55aa-4d4b-a86f-c8841e9311c4',
    email: 'test1@dot.com',
    password: '$2a$10$7TWxkB5ZBRtj8WmpqhJBUeysQKkuNaxIC0MjM/wOeRK.F08gHjBva',
    firstName: 'Test1',
    lastName: 'Test1',
    deleted: true,
    role: UserRole.recruiter,
    tenantId: testTenants[0].id,
  },
];
