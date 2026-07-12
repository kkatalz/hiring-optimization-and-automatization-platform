export const UserRole = {
  superAdmin: 'superAdmin',
  admin: 'admin',
  recruiter: 'recruiter',
  candidate: 'candidate',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole]; 
