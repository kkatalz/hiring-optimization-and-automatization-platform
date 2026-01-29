import { UserRole } from '../../../entities/role.enum';
import { CandidateProfile } from '../../../entities/candidateProfile';
import { CandidateProfileDto } from '../dto/candidateProfile.dto';
import { UserDto } from '../../../user/dto/user.dto';

export const candidateToCandidateProfileDto = ({
  user,
}: {
  user: UserDto & { candidateProfile: CandidateProfile };
}): CandidateProfileDto => {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: UserRole.candidate,
    yearsOfExperience: user.candidateProfile?.yearsOfExperience,
    country: user.candidateProfile?.country,
    city: user.candidateProfile?.city,
    languages: user.candidateProfile?.languages,
  };
};
