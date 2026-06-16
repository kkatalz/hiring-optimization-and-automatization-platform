import { Interview } from '../../entities/interview';
import { UserRole } from '../../entities/role.enum';
import { InterviewViewDto } from '../dto/interviewView.dto';

export function toInterviewViewDto(
  interview: Interview,
  viewerRole: UserRole,
): InterviewViewDto {
  const dto: InterviewViewDto = {
    id: interview.id,
    meetLink: interview.meetLink,
    scheduledDate: interview.scheduledDate,
    durationMinutes: interview.durationMinutes,
    submissionId: interview.submissionId,
    tenantId: interview.tenantId,
    interviewersEmails: interview.interviewersEmails ?? [],
    candidateEmail: interview.candidateEmail,
    status: interview.status,
    createdAt: interview.createdAt,
    updatedAt: interview.updatedAt,
  };

  if (viewerRole !== UserRole.candidate) dto.notes = interview.notes;

  return dto;
}
