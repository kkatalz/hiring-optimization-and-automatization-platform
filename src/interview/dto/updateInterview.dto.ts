import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { InterviewStatus } from '../../entities/statuses.enum';

export class UpdateInterviewDto {
  @IsEnum(InterviewStatus)
  status: InterviewStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
