import { UserRole } from '../../../entities/role.enum';
import { CandidateProfile } from '../../../entities/candidateProfile';
import { CandidateProfileDto } from '../dto/candidateProfile.dto';

export const candidateToCandidateProfileDto = (
  candidateProfile: CandidateProfile,
): CandidateProfileDto => {
  return {
    userId: candidateProfile?.user.id,
    email: candidateProfile?.user.email,
    firstName: candidateProfile?.user.firstName,
    lastName: candidateProfile?.user.lastName,
    role: UserRole.candidate,
    yearsOfExperience: candidateProfile?.yearsOfExperience,
    country: candidateProfile?.country,
    city: candidateProfile?.city,
    languages: candidateProfile?.languages,
    submissions: candidateProfile?.submissions,
  };
};
