import {
  IsArray,
  IsDate,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInterviewDto {
  @IsUUID()
  submissionId: string;

  @IsUrl({ require_protocol: true })
  meetLink: string;

  @Type(() => Date)
  @IsDate()
  scheduledDate: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  interviewersEmails?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
