import { InterviewStatus } from '../../entities/statuses.enum';

export class UpdateInterviewDto {
  status: InterviewStatus;
  notes?: string;
}
