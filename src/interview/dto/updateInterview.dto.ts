import { InterviewStatus } from '../../entities/status.enum';

export class UpdateInterviewDto {
  status: InterviewStatus;
  notes?: string;
}
