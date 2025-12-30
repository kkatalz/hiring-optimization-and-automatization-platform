import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VacancySubmission } from '../../entities/vacancySubmission';

export class VacancyDto {
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  salary?: string;

  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @IsNotEmpty()
  @IsString()
  createdById: string;

  @IsOptional()
  submissions?: VacancySubmission[];
}
