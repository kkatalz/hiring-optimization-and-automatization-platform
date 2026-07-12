import type { UserRole } from './role.enum';
import type { Tenant } from './tenant';
import type { Vacancy } from './vacancy';
import type { CandidateProfile } from './candidateProfile';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  deleted: boolean;
  role: UserRole;
  tenantId?: string;
  tenant?: Tenant;
  createdVacancies?: Vacancy[];
  candidateProfile?: CandidateProfile;
}
