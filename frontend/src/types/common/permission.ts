import { UserRole } from '../role.enum';

export type Permission =
  | 'vacancy:getById'
  | 'vacancy:create'
  | 'vacancy:update'
  | 'vacancy:delete'
  | 'vacancySubmissions:getByVacancyId'
  | 'vacancySubmissions:approve'
  | 'vacancySubmissions:reject'
  | 'clustering:runByVacancyId'
  | 'interview:schedule';

/** Mirrors the @Roles(...) decorator of the backend controllers.
    If a decorator changes, change it here too. This file is the only
    place the frontend is allowed to know about roles. */
export const PERMISSIONS: Record<Permission, readonly UserRole[]> = {
  'vacancy:getById': [UserRole.superAdmin, UserRole.admin, UserRole.recruiter],
  'vacancy:create': [UserRole.admin, UserRole.recruiter],
  'vacancy:update': [UserRole.admin, UserRole.recruiter],
  'vacancy:delete': [UserRole.admin, UserRole.recruiter],
  'vacancySubmissions:getByVacancyId': [
    UserRole.superAdmin,
    UserRole.admin,
    UserRole.recruiter,
  ],
  'vacancySubmissions:approve': [
    UserRole.superAdmin,
    UserRole.admin,
    UserRole.recruiter,
  ],
  'vacancySubmissions:reject': [
    UserRole.superAdmin,
    UserRole.admin,
    UserRole.recruiter,
  ],
  'clustering:runByVacancyId': [
    UserRole.superAdmin,
    UserRole.admin,
    UserRole.recruiter,
  ],
  'interview:schedule': [UserRole.admin, UserRole.recruiter],
};

export const hasPermission = (
  userRole: UserRole | undefined,
  permission: Permission,
): boolean => {
  return userRole !== undefined && PERMISSIONS[permission].includes(userRole);
};
