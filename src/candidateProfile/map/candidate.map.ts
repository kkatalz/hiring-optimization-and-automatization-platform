import { UserRole } from '../../entities/role.enum';
import { CandidateProfile } from '../../entities/candidateProfile';
import { CandidateProfileDto } from '../dto/candidateProfile.dto';

export const candidateToCandidateProfileDto = (
  candidateProfile: CandidateProfile,
): CandidateProfileDto => {
  return {
    userId: candidateProfile.user.id,
    email: candidateProfile.user.email,
    firstName: candidateProfile.user.firstName,
    lastName: candidateProfile.user.lastName,
    role: UserRole.candidate,
    yearsOfExperience: candidateProfile?.yearsOfExperience,
    country: candidateProfile?.country,
    city: candidateProfile?.city,
    languages: candidateProfile?.languages,
    resume: candidateProfile?.resume,
    resumeAiScore: candidateProfile?.resumeAiScore ?? null,
    resumeAiSentenceScores: candidateProfile?.resumeAiSentenceScores ?? null,
    submissions: candidateProfile?.submissions?.map((s) => ({
      id: s.id,
      vacancyId: s.vacancyId,
      status: s.status,
      comment: s.comment,
      resume: s.resume,
      tags: s.tags,
      expectedSalary: s.expectedSalary,
      createdAt: s.createdAt,
    })),
  };
};
