import { Tenant } from '../../src/entities/tenant';

export const testTenants: Tenant[] = [
  {
    id: 'df0787ee-3bd2-49bd-a0aa-de97b112e3b6',
    email: 'test1@dot.com',
    slug: 'test1',
    deleted: false,
  },
  {
    id: '52995d6e-1ab1-4287-99b7-5dcfe58aba27',
    email: 'test2@dot.com',
    slug: 'test2',
    deleted: false,
  },

  {
    id: '5181e02a-1bf9-4201-abe2-a07c41ac85bf',
    email: 'test3@dot.com',
    slug: 'test3',
    deleted: true,
  },

  // This tenant doesn't have any questions — used to test the case when a tenant exists but has no related questions

  {
    id: 'c9b1e02a-1bf9-4201-abe2-a07c41ac85bf',
    email: 'test4@dot.com',
    slug: 'test4',
    deleted: false,
  },
];

export const EXPECTED_ACTIVE_TENANTS_NUM = testTenants.filter(
  (tenant) => !tenant.deleted,
).length;

export const EXPECTED_TOTAL_TENANTS_NUM = testTenants.length;
