import {
  IsArray,
  IsDate,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInterviewDto {
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
  interviewers?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
