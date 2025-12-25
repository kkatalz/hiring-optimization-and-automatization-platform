import { IsOptional, IsString } from 'class-validator';

export class UpdateVacancyDto {
  @IsOptional()
  name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  tags: string[];

  @IsOptional()
  @IsString()
  salary?: string;
}
