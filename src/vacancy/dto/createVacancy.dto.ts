import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVacancyDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  salary?: string;
}
