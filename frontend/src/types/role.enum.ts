export const UserRole = {
  superAdmin: 'superAdmin',
  admin: 'admin',
  recruiter: 'recruiter',
  candidate: 'candidate',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const STAFF_ROLES: UserRole[] = [
  UserRole.superAdmin,
  UserRole.admin,
  UserRole.recruiter,
];
