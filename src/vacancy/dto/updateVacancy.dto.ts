import { IsOptional, IsString } from 'class-validator';

export class UpdateVacancyDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  salary?: string;
}
