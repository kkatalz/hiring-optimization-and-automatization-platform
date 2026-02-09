import { LanguageProficiency } from '../../../entities/hiring.enum';
import { UserRole } from '../../../entities/role.enum';

export class CandidateProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole.candidate;
  token?: string;
  yearsOfExperience: number;
  country: string;
  city: string;
  languages: LanguageProficiency[];
}
