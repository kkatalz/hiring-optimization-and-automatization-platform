import { STAFF_ROLES, UserRole } from '@/types';

export const isStaff = (role?: UserRole) =>
  !!role && STAFF_ROLES.includes(role);
